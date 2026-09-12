import { NextResponse } from 'next/server';
import {
  toolCalcularMateriales,
  toolBuscarCatalogo,
  CalculationResult,
} from '@/lib/agentTools';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `
Eres "Don Carlos", el Maestro y Asesor Técnico de "Ferretería Construye" (ConstruyeWeb) en Nicaragua.
Tu función es asesorar a clientes sobre proyectos de construcción, mampostería, pintura y herramientas.

REGLAS DE DECISIÓN DE HERRAMIENTAS:
1. Si el cliente menciona calcular materiales para una pared, muro o albañilería (ej. "pared de 4x3"), INVOCA INMEDIATAMENTE la función 'calcular_materiales' con tipo_proyecto: 'pared_bloque' y las dimensiones detectadas.
2. Si el cliente menciona pintar un cuarto, paredes o pintura (ej. "cuarto de 4x4"), INVOCA 'calcular_materiales' con tipo_proyecto: 'pintura'.
3. Si el cliente pide recomendaciones de herramientas básicas o kit para casa, INVOCA 'calcular_materiales' con tipo_proyecto: 'kit_herramientas'.
4. Si el cliente busca un producto específico por nombre, INVOCA 'buscar_productos'.
5. Sé conciso, cordial y habla con tono técnico accesible. Los precios son en Córdobas (C$) con 15% de IVA.
`;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron mensajes' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.content.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY;

    // Si hay GEMINI_API_KEY configurada, nos conectamos a Gemini en vivo
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
              },
              contents: messages.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: 'calcular_materiales',
                      description:
                        'Calcula la cantidad requerida de bloques, sacos de cemento o pintura según el proyecto y dimensiones en metros',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          tipo_proyecto: {
                            type: 'STRING',
                            description: 'Tipo de proyecto: pared_bloque, pintura, o kit_herramientas',
                          },
                          largo: { type: 'NUMBER', description: 'Largo en metros' },
                          alto: { type: 'NUMBER', description: 'Alto en metros' },
                          area: { type: 'NUMBER', description: 'Área en m²' },
                        },
                        required: ['tipo_proyecto'],
                      },
                    },
                    {
                      name: 'buscar_productos',
                      description: 'Busca productos y precios en el catálogo de Ferretería Construye',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          query: { type: 'STRING', description: 'Término a buscar' },
                        },
                        required: ['query'],
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0];

          // Si Gemini decidió llamar a una herramienta (Function Call)
          if (candidate?.functionCall) {
            const { name, args } = candidate.functionCall;
            let proposal: CalculationResult | null = null;
            let productsFound: unknown[] | null = null;
            let replyText = '';

            if (name === 'calcular_materiales') {
              proposal = toolCalcularMateriales(
                args.tipo_proyecto || 'pared_bloque',
                {
                  largo: args.largo,
                  alto: args.alto,
                  area: args.area,
                }
              );
              replyText = `¡Con mucho gusto! He calculado la cantidad exacta de materiales para tu proyecto de ${proposal.proyecto} considerando el rendimiento técnico y la merma recomendada. Te he preparado la cotización con existencias reales en tienda:`;
            } else if (name === 'buscar_productos') {
              productsFound = toolBuscarCatalogo(args.query || '');
              replyText = `He buscado en nuestro inventario productos relacionados con "${args.query}":`;
            }

            return NextResponse.json({
              role: 'assistant',
              content: replyText,
              model: 'Gemini 2.5 Flash (Live)',
              proposal,
              productsFound,
            });
          }

          // Si respondió directamente con texto
          if (candidate?.text) {
            let proposal: CalculationResult | null = null;
            if (userText.includes('pared') || userText.includes('bloque') || userText.includes('muro')) {
              const match = userText.match(/(\d+(?:\.\d+)?)\s*(?:x|por|\*)\s*(\d+(?:\.\d+)?)/i);
              proposal = toolCalcularMateriales('pared_bloque', {
                largo: match ? parseFloat(match[1]) : 4,
                alto: match ? parseFloat(match[2]) : 2.5,
              });
            } else if (userText.includes('pint') || userText.includes('cuarto')) {
              const match = userText.match(/(\d+(?:\.\d+)?)\s*(?:x|por|\*)\s*(\d+(?:\.\d+)?)/i);
              proposal = toolCalcularMateriales('pintura', {
                largo: match ? parseFloat(match[1]) : 4,
                ancho: match ? parseFloat(match[2]) : 4,
              });
            } else if (userText.includes('herramienta') || userText.includes('kit') || userText.includes('combo')) {
              proposal = toolCalcularMateriales('kit_herramientas');
            }

            return NextResponse.json({
              role: 'assistant',
              content: candidate.text,
              model: 'Gemini 2.5 Flash (Live)',
              proposal,
              productsFound: null,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Fallo llamada a Gemini API, usando motor de razonamiento local:', geminiError);
      }
    }

    // =========================================================================
    // MOTOR DE RAZONAMIENTO Y TOOL CALLING LOCAL (Sin requerir API Key externa)
    // =========================================================================
    let proposal: CalculationResult | null = null;
    let productsFound: unknown[] | null = null;
    let content = '';

    // Extracción de números en el texto para dimensiones (ej: "pared de 4x3", "4 metros")
    const matchDimensiones = userText.match(/(\d+(?:\.\d+)?)\s*(?:x|por|\*)\s*(\d+(?:\.\d+)?)/i);
    const largoDetectado = matchDimensiones ? parseFloat(matchDimensiones[1]) : 4;
    const altoDetectado = matchDimensiones ? parseFloat(matchDimensiones[2]) : 2.5;

    // Caso A: Consulta de Pared / Bloques / Cemento
    if (
      userText.includes('pared') ||
      userText.includes('bloque') ||
      userText.includes('muro') ||
      userText.includes('cemento') ||
      userText.includes('albanil')
    ) {
      proposal = toolCalcularMateriales('pared_bloque', {
        largo: largoDetectado,
        alto: altoDetectado,
      });
      content = `¡Buenas! Para levantar esa pared de ${proposal.dimensiones}, te preparé el cálculo técnico exacto con factor de merma del 5% por cortes. Aquí tienes la lista de materiales con precios vigentes en ConstruyeWeb:`;
    }
    // Caso B: Consulta de Pintura
    else if (
      userText.includes('pint') ||
      userText.includes('cuarto') ||
      userText.includes('habitaci') ||
      userText.includes('color') ||
      userText.includes('brocha') ||
      userText.includes('rodillo')
    ) {
      proposal = toolCalcularMateriales('pintura', {
        largo: largoDetectado,
        ancho: altoDetectado,
      });
      content = `¡Excelente proyecto! Para pintar esa superficie (${proposal.dimensiones}), te conviene la cubeta de 5 galones de Corona que rinde hasta dos manos con acabado lavable. También te incluí el rodillo profesional y cinta masking para los marcos:`;
    }
    // Caso C: Herramientas / Combo / Mantenimiento
    else if (
      userText.includes('herramienta') ||
      userText.includes('kit') ||
      userText.includes('combo') ||
      userText.includes('casa') ||
      userText.includes('taller') ||
      userText.includes('basico')
    ) {
      proposal = toolCalcularMateriales('kit_herramientas');
      content = `Con gusto. Te preparé un kit esencial con las herramientas manuales más duraderas de Stanley y Truper para cualquier reparación en el hogar:`;
    }
    // Caso D: Búsqueda libre en catálogo
    else {
      // Buscar productos según la palabra clave
      const palabras = userText.split(' ').filter((w) => w.length > 3);
      const query = palabras[0] || 'herramientas';
      const resultados = toolBuscarCatalogo(query);

      if (resultados.length > 0) {
        productsFound = resultados;
        content = `Encontré estos artículos disponibles en nuestro inventario para tu búsqueda:`;
      } else {
        content = `¡Hola! Soy Don Carlos, maestro técnico de Ferretería Construye. Puedo calcularte materiales para construir paredes de bloques, calcular pintura para tus habitaciones, o recomendarte herramientas de marcas como Stanley, DeWalt y Truper. ¿Qué proyecto estás planeando?`;
      }
    }

    return NextResponse.json({
      role: 'assistant',
      content,
      model: apiKey ? 'Gemini 2.5 Flash' : 'Motor Técnico Experto (Local)',
      proposal,
      productsFound,
    });
  } catch (error) {
    console.error('Error en /api/agent:', error);
    return NextResponse.json(
      { error: 'Error procesando solicitud del agente' },
      { status: 500 }
    );
  }
}

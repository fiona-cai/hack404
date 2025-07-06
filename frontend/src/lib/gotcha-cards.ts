import supabase from './database';
import { GotchaCard, CardGenerationContext } from './gotcha-types';
import { ai } from './gemini';

/**
 * Generates a dynamic card using Gemini AI based on context
 */
async function generateDynamicCard(context: CardGenerationContext): Promise<GotchaCard | null> {
  try {
    const prompt = buildPromptFromContext(context);

    // Call Gemini AI to generate a dynamic card
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt + `

Please respond with a JSON object in this exact format:
{
  "title": "Card Title (max 30 chars)",
  "description": "What users should do (max 150 chars)",
  "type": "one of: compliment, question, challenge, fun_fact, icebreaker, dare, memory, prediction",
  "rarity": "one of: common, uncommon, rare, epic, legendary",
  "icon_emoji": "single emoji",
  "background_color": "#hexcode",
  "text_color": "#hexcode", 
  "tags": ["tag1", "tag2"]
}

Make it creative and personalized based on the user context provided.`,
    });

    const text = response.text;

    if (!text) {
      throw new Error('No text response from Gemini AI');
    }
    
    // Try to parse the JSON response
    let aiCard;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiCard = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text, 'Error:', parseError);
      // Fallback to a simple dynamic card
      aiCard = {
        title: "AI Connection",
        description: `${context.userA.name} and ${context.userB.name}, share your favorite memory from this year!`,
        type: 'memory',
        rarity: 'uncommon',
        icon_emoji: '🤖',
        background_color: '#6366f1',
        text_color: '#ffffff',
        tags: ['ai-generated', 'memory']
      };
    }

    const dynamicCard: GotchaCard = {
      id: crypto.randomUUID(),
      title: aiCard.title || "AI Connection",
      description: aiCard.description || `${context.userA.name} and ${context.userB.name}, let's connect!`,
      type: aiCard.type || 'question',
      rarity: aiCard.rarity || 'uncommon',
      icon_emoji: aiCard.icon_emoji || '�',
      background_color: aiCard.background_color || '#6366f1',
      text_color: aiCard.text_color || '#ffffff',
      is_dynamic: true,
      tags: aiCard.tags || ['ai-generated'],
      weight: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store the generated card in Supabase for future reference
    const { data, error } = await supabase
      .from('gotcha_cards')
      .insert(dynamicCard)
      .select()
      .single();

    if (error) {
      console.error('Failed to store dynamic card:', error);
      return dynamicCard; // Return the card even if storage fails
    }

    return data;
  } catch (error) {
    console.error('Error generating dynamic card:', error);
    return null;
  }
}

/**
 * Gets a random static card from Supabase, weighted by rarity
 */
async function getRandomStaticCard(): Promise<GotchaCard | null> {
  try {
    // Get all static cards
    const { data: allCards, error } = await supabase
      .from('gotcha_cards')
      .select('*')
      .eq('is_dynamic', false);

    if (error || !allCards || allCards.length === 0) {
      console.error('Failed to fetch cards:', error);
      return null;
    }

    // Calculate total weight
    const totalWeight = allCards.reduce((sum, card) => sum + (card.weight || 100), 0);
    
    // Generate random number between 0 and totalWeight
    const randomWeight = Math.random() * totalWeight;
    
    // Find the card that corresponds to this weight
    let currentWeight = 0;
    for (const card of allCards) {
      currentWeight += (card.weight || 100);
      if (randomWeight <= currentWeight) {
        return card;
      }
    }

    // Fallback to random card
    return allCards[Math.floor(Math.random() * allCards.length)];
  } catch (error) {
    console.error('Error fetching static card:', error);
    return null;
  }
}

/**
 * Main function to get a random card (static or dynamic)
 * @param context - Optional context for dynamic generation
 * @param forceDynamic - Force dynamic generation (default: 20% chance)
 */
export async function getRandomCard(
  context?: CardGenerationContext,
  forceDynamic: boolean = false
): Promise<GotchaCard | null> {
  const shouldGenerateDynamic = forceDynamic || (context && Math.random() < 0.2); // 20% chance for dynamic

  if (shouldGenerateDynamic && context) {
    console.log('Attempting to generate dynamic card...');
    const dynamicCard = await generateDynamicCard(context);
    
    if (dynamicCard) {
      return dynamicCard;
    }
    
    console.log('Dynamic generation failed, falling back to static card');
  }

  return await getRandomStaticCard();
}

/**
 * Gets a card by specific type
 */
export async function getRandomCardByType(type: GotchaCard['type']): Promise<GotchaCard | null> {
  try {
    const { data, error } = await supabase
      .from('gotcha_cards')
      .select('*')
      .eq('type', type)
      .eq('is_dynamic', false);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Weighted random selection
    const totalWeight = data.reduce((sum, card) => sum + (card.weight || 100), 0);
    const randomWeight = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const card of data) {
      currentWeight += (card.weight || 100);
      if (randomWeight <= currentWeight) {
        return card;
      }
    }

    return data[Math.floor(Math.random() * data.length)];
  } catch (error) {
    console.error('Error getting card by type:', error);
    return null;
  }
}

/**
 * Builds a prompt for dynamic card generation from context
 */
function buildPromptFromContext(context: CardGenerationContext): string {
  const { userA, userB, location } = context;
  
  let prompt = `Generate a creative "Gotcha Card" for two people who just met: ${userA.name} and ${userB.name}.\n\n`;
  
  // Add interests context
  if (userA.interests?.length > 0) {
    prompt += `${userA.name}'s interests: ${userA.interests.join(', ')}\n`;
  }
  if (userB.interests?.length > 0) {
    prompt += `${userB.name}'s interests: ${userB.interests.join(', ')}\n`;
  }
  
  // // Add location context
  // if (location) {
  //   prompt += `They met at coordinates: ${location.lat}, ${location.lng}\n`;
  // }
  
  prompt += `\nCreate a fun, engaging activity or conversation starter that would help them connect. The card should have:
- A catchy title (max 30 characters)
- A clear description of what they should do (max 150 characters)
- No asterisks or formatting in the text
- A type (compliment, question, challenge, fun_fact, icebreaker, dare, memory, prediction)
- An appropriate emoji icon
- Engaging background color (hex code)
- Appropriate text color (hex code)
- 2-3 relevant tags

Make it appropriate for strangers who just met and want to connect in a friendly way.`;

  return prompt;
}

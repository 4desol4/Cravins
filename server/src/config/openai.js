const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Choose the model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

/**
 * Utility to clean Gemini response before JSON.parse
 */
const cleanJSON = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

/**
 * Generate questions using Gemini with uniqueness enforcement
 */
const generateQuestions = async (
  subject,
  topics,
  difficulty,
  count,
  existingQuestions = []
) => {
  try {
    const topicsText = Array.isArray(topics) ? topics.join(", ") : topics;

    // Create a summary of existing questions to avoid duplicates
    const existingSummary =
      existingQuestions.length > 0
        ? `\nAvoid creating questions similar to these existing ones:\n${existingQuestions
            .slice(0, 10)
            .map((q, i) => `${i + 1}. ${q.text.substring(0, 100)}...`)
            .join("\n")}`
        : "";

    const prompt = `Generate ${count} UNIQUE multiple choice questions for ${subject} covering these topics: ${topicsText}.
    Difficulty: ${difficulty}.
    ${existingSummary}
    
    IMPORTANT REQUIREMENTS:
    - Each question MUST be completely unique and different from existing questions
    - Questions should cover different concepts, formulas, or scenarios
    - Use varied question formats (calculation, concept, application, analysis)
    - Follow Nigerian senior secondary school curriculum standards
    - Include diverse real-world examples and scenarios
    
    Format each question as JSON with:
      - text (string): The complete question text
      - options (array of exactly 4 strings): Four distinct answer choices
      - correctAnswer (number): Index 0-3 indicating correct option
      - explanation (string): Clear explanation of the correct answer
    
    Return ONLY a valid JSON array of ${count} questions. No additional text.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = cleanJSON(text);

    const generatedQuestions = JSON.parse(text);

    // Validate the response
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    // Validate each question structure
    return generatedQuestions.filter((q) => {
      return (
        q.text &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        q.explanation
      );
    });
  } catch (error) {
    console.error(`Gemini question generation error:`, error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Generate topics for a subject with uniqueness check
 * Strictly follows Nigerian Senior Secondary School curriculum (WAEC/NECO/JAMB)
 */
const generateTopics = async (subject, count = 14, existingTopics = []) => {
  try {
    const existingList =
      existingTopics.length > 0
        ? `\nExisting topics to avoid duplicating:\n${existingTopics.join(
            ", "
          )}`
        : "";

    const prompt = `Generate ${count} UNIQUE curriculum-based topics for ${subject} based on NIGERIAN SENIOR SECONDARY SCHOOL curriculum (SS1, SS2, SS3).
    ${existingList}
    
    CRITICAL REQUIREMENTS:
    - Follow ONLY Nigerian WAEC, NECO, and JAMB syllabus
    - Topics MUST be from the official Nigerian senior secondary curriculum
    - Do NOT include topics from other countries' curricula
    - Maximum 70 topics total per subject (Nigerian curriculum standard)
    - Topics must be distinct from existing topics listed above
    - Cover different areas within the Nigerian syllabus
    - Be specific and clear
    - Topics should match what Nigerian students study in SS1-SS3
    
    NIGERIAN CURRICULUM FOCUS:
    - For Mathematics: Nigerian syllabus topics only (e.g., Indices, Logarithms, Sequence and Series, etc.)
    - For Physics: Nigerian syllabus (e.g., Waves, Optics, Electricity, Motion, etc.)
    - For Chemistry: Nigerian curriculum (e.g., Periodic Table, Organic Chemistry, etc.)
    - For Biology: WAEC/NECO topics (e.g., Ecology, Genetics, Cell Biology, etc.)
    - For English: Nigerian literature and language curriculum
    - For other subjects: Follow Nigerian secondary school standards
    
    Return ONLY a JSON array of ${count} topic name strings. No additional text or explanation.
    Example format: ["Topic 1", "Topic 2", "Topic 3"]
    
    The topics MUST align with what Nigerian students encounter in WAEC and NECO examinations.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = cleanJSON(text);

    const topics = JSON.parse(text);

    if (!Array.isArray(topics)) {
      throw new Error("Invalid topics format from Gemini");
    }

    // Filter out any duplicates with existing topics (case-insensitive)
    const existingLower = existingTopics.map((t) => t.toLowerCase());
    return topics.filter(
      (topic) =>
        typeof topic === "string" &&
        topic.trim() &&
        !existingLower.includes(topic.toLowerCase())
    );
  } catch (error) {
    console.error(`Gemini topic generation error:`, error);
    throw new Error(`Failed to generate topics: ${error.message}`);
  }
};

/**
 * Chat with Gemini for study bot
 */
const chatWithBot = async (message, history = []) => {
  try {
    const systemPrompt = `You are Cravins Bot, a friendly and knowledgeable AI tutor specializing in Nigerian secondary school subjects.
    Help students learn by providing clear explanations, examples, and guidance.
    Be encouraging and adapt your teaching style to the student's needs.
    Focus on subjects like Mathematics, English, Physics, Chemistry, Biology, Commerce, Economics, etc.
    Follow Nigerian curriculum standards (WAEC, NECO, JAMB).`;

    // Convert history into Gemini format
    const formattedHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    // Build conversation
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    return result.response.text();
  } catch (error) {
    console.error(`Gemini chat error:`, error);
    throw new Error(`Chat failed: ${error.message}`);
  }
};

module.exports = {
  genAI,
  generateQuestions,
  generateTopics,
  chatWithBot,
};

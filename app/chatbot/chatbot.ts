import User from '@/utils/user.model';
import BookDetail from '@/utils/book.model';
import OpenAI from 'openai';
import { GetISBNBook, GetISBNBooks } from '@/services/serviceProvider';

const requestChatbot = async (input: string, userData: User) => {
    const client = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    });

    const instructions = `First step: Analyse the given question {input} among three categories:
    1. Direct detailed question: the user would like to know detailed information about the given book(s).
        - Answer the question in a long text.
    2. Book list question: the user would like to know any list of books depending on user's preference and given variables.
        - Answer the question in a list of book id(s) from ISBN database.
    3. Unprompted question: the user ask the question that is out of the scope of the other question types.
        - Answer the question in a request to the user to ask the question within the other question types.

    Second Step: Answer the user's question based on question type above
    Context: ${userData}
    Question: {input}

    Third Step: Transform the output into the following format
    1. Direct detailed question:
        - { "type": 1, "answer": {output} }
    2. Book list question:
        - { "type": 2, "answer": { "header": "header_of_the_answer", "bookList": [firstISBNBookID, secondISBNBookID, ...]}
    3. Unprompted question:
        - { "type": 0, "answer": {output} }
    `;

    const resp = await client.responses.create({
        model: 'gpt-4o',
        instructions: instructions,
        input: input,
    })

    const output_json: ChatbotResponse = JSON.parse(resp.output_text);
    console.log("Output text: " + JSON.stringify(output_json));
    return output_json;
}

const requestBookInfo = async (isbnIDs: string[]) => {
    const resp = await GetISBNBooks(isbnIDs);
    
    if (!resp) return;

    if (!resp.ok)
    {
        console.log(resp.status);
        return;
    }

    const bookDetail = await resp.json();
    console.log(bookDetail);
}

export { requestChatbot, requestBookInfo};
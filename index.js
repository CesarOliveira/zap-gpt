import { create } from 'venom-bot'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from "openai"

dotenv.config()

create({
    session: 'Chat-GPT',
    multidevice: true
})
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

const configuration = new Configuration({
    organization: process.env.ORGANIZATION_ID,
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

const getDavinciResponse = async (clientText) => {
    const options = {
        model: "text-davinci-003",
        prompt: clientText,
        temperature: 1,
        max_tokens: 2000
    }

    try {
        const response = await openai.createCompletion(options)
        let botResponse = ""
        response.data.choices.forEach(({ text }) => {
            botResponse += text
        })
        return `Chat GPT 🤖\n\n ${botResponse.trim()}`
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
}

const getDalleResponse = async (clientText) => {
    const options = {
        prompt: clientText, // Descrição da imagem
        n: 1, // Número de imagens a serem geradas
        size: "1024x1024", // Tamanho da imagem
    }

    try {
        const response = await openai.createImage(options);
        return response.data.data[0].url
    } catch (e) {
        throw new Error(`❌ OpenAI Response Error: ${e.response.data.error.message}`)
    }
}

const commands = (client, message) => {
    const iaCommands = {
        davinci3: ".b",
        dalle: ".i"
    }

    let firstWord = message.text.substring(0, message.text.indexOf(" "));


    let to = message.to;
    if (message.isGroupMsg) {
        to = message.chatId;
    }

    try {
        switch (firstWord) {
            case iaCommands.davinci3:
                const question = message.text.substring(message.text.indexOf(" "));
                getDavinciResponse(question).then((response) => {
                    client.sendText(to, response)
                })
                break;

            case iaCommands.dalle:
                const imgDescription = message.text.substring(message.text.indexOf(" "));
                getDalleResponse(imgDescription, message).then((imgUrl) => {
                    client.sendImage(
                        to,
                        imgUrl,
                        imgDescription,
                        `🤖 Chat GPT\n\n
    ${imgDescription}\n\n
    Imagem gerada pela IA DALL-E`
                    )
                }).catch((e) => {
                    client.sendText(to, e.message)
                });
                break;
        }
    } catch (e) {
        client.sendText(to, `❌ OpenAI Response Error: ${e.message}`);
    }
}

async function start(client) {
    client.onAnyMessage((message) => commands(client, message));
}

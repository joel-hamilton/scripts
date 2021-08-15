const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();
async function ssmlToAudio(text, filename) {
    const request = {
        input: { ssml: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filename, response.audioContent, 'binary');
}

function textToSsml(inputFile) {
    let rawLines = '';
    try {
        rawLines = fs.readFileSync(inputFile, 'utf8');
    } catch (e) {
        console.log('Error:', e.stack);
        return;
    }

    // Replace special characters with HTML Ampersand Character Codes
    // These codes prevent the API from confusing text with SSML tags
    // For example, '<' --> '&lt;' and '&' --> '&amp;'
    let escapedLines = rawLines;
    escapedLines = escapedLines.replace(/&/g, '&amp;');
    escapedLines = escapedLines.replace(/"/g, '&quot;');
    escapedLines = escapedLines.replace(/</g, '&lt;');
    escapedLines = escapedLines.replace(/>/g, '&gt;');

    // Convert plaintext to SSML
    // Tag SSML so that there is a 2 second pause between each address
    const expandedNewline = escapedLines.replace(/\n\n/g, '\n<break time="2s"/>');
    const ssml = '<speak>' + expandedNewline + '</speak>';

    return ssml;
}

(async() =>{
    const file = process.argv[2];
    const ssml = textToSsml(file);
    const pos = file.lastIndexOf(".");
    const newFileName = file.substr(0, pos < 0 ? file.length : pos) + ".mp3";
    await ssmlToAudio(ssml, newFileName);
    console.log(`File writen to ${newFileName}`);
})();

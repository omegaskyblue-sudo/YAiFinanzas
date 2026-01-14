import handler from 'serve-handler';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((request, response) => {
    // Fix for GitHub Pages build path compatibility
    // If request comes with /YAiFinanzas prefix, strip it so serve-handler finds the file in dist
    if (request.url.startsWith('/YAiFinanzas/')) {
        request.url = request.url.replace('/YAiFinanzas', '');
    } else if (request.url === '/YAiFinanzas') {
        request.url = '/';
    }

    return handler(request, response, {
        public: path.join(__dirname, 'dist'),
        rewrites: [
            { source: '**', destination: '/index.html' }
        ]
    });
});

const PORT = 3006;

server.listen(PORT, () => {
    console.log(`YAiFinanzas Service running at http://localhost:${PORT}`);
});

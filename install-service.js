import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new service object
const svc = new Service({
    name: 'YAiFinanzas Service',
    description: 'Servicio de servidor web para YuliedSoft YAiFinanzas.',
    script: path.join(__dirname, 'server.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    console.log('Servicio YAiFinanzas instalado correctamente.');
    svc.start();
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', function () {
    console.log('El servicio ya estaba instalado.');
    svc.start();
});

// Listen for the "start" event
svc.on('start', function () {
    console.log('Servicio YAiFinanzas iniciado.');
});

// Install the script as a service.
svc.install();

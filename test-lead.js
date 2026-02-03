
// using global fetch

async function test() {
    try {
        const lead = {
            name: 'Test Debugger',
            email: 'debug@test.com',
            phone: '1234567890',
            message: 'Debugging submission'
        };

        const response = await fetch('https://claryntia-worker.garyphadale.workers.dev/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();

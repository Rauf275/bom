function simulateIncomingCalls(count = 10) {
    const callTypes = ['Unknown', 'Robot', 'Scam', 'Legitimate', 'Missed'];
    const numbers = [
        '+79991234567',
        '+78005553535',
        '+74951234567',
        '112',
        '+79167654321'
    ];

    for (let i = 0; i < count; i++) {
        const call = {
            id: i + 1,
            number: numbers[Math.floor(Math.random() * numbers.length)],
            type: callTypes[Math.floor(Math.random() * callTypes.length)],
            duration: Math.floor(Math.random() * 60), // 0–59 секунд
            timestamp: new Date().toISOString()
        };

        console.log('Incoming call:', call);
        // Передайте call в вашу систему для анализа
        // analyzeCall(call);
    }
}

// Запуск симуляции 8 звонков
simulateIncomingCalls(8);

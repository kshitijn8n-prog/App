async function testAll() {
    const endpoints = [
        '/api/wishlist',
        '/api/enquiries',
        '/api/admin/enquiries',
        '/api/admin/bookings'
    ];
    for (const url of endpoints) {
        try {
            const res = await fetch(`http://localhost:3000${url}`);
            console.log(`${url} -> Status: ${res.status}`);
            if (res.status === 500) {
                console.log('Error Body:', await res.text());
            }
        } catch (err) {
            console.error(`${url} -> Failed: ${err.message}`);
        }
    }
}
testAll();

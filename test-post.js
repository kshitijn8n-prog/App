async function testPost() {
    try {
        const res = await fetch('http://localhost:3000/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({ roomId: '66eb85f26ea54d6023363641' }), // A dummy ID
            headers: { 'Content-Type': 'application/json' }
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}
testPost();

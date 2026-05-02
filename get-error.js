async function getError() {
    try {
        const res = await fetch('http://localhost:3000/api/wishlist');
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}
getError();

async function visit() {
    try {
        const resp = await fetch('/api/visit');
        if (!resp.ok) return;
        const response = await resp.json();
        document.getElementById('person_time').innerText = response['person_time'];
        document.getElementById('person_num').innerText = response['person_num'];
    }
    catch (e) {
        // ignore
    }
}
visit();
function visit() {
    xhr = new XMLHttpRequest();
    //xhr.open("GET", "/api/visit", true);
    xhr.open("GET", "/api/visit", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById('person_time').innerText = response['person_time'];
            document.getElementById('person_num').innerText = response['person_num'];
        }
    };
    xhr.send();
}
visit();
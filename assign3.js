var total, favorites;

function getGists() {
    total = 0;
    var pages = document.getElementById('pages').value;
    document.getElementById('resultsDiv').innerHTML =
        "<h3>Search Results</h3><p id='results'></p>";

    if (pages < 1) {
        alert('1 page is the minimum allowed query. Showing 1 page of ' +
        'results.');
        pages = 1;
    }
    if (pages > 5) {
        alert('5 pages is the maximum allowed query. Only showing 5 pages of ' +
        'results.');
        pages = 5;
    }

    for (var i = 1; i <= pages; i++) {
        var req = new XMLHttpRequest();
        if (!req) {
            throw 'Could not create new HttpRequest.';
        }

        var url = 'https://api.github.com/gists?page=' + i;
        var results = document.getElementById('results');
        req.onreadystatechange = function() {
            if (this.readyState < 4) {
                results.textContent = 'Retrieving results...';
            }
            if (this.readyState === 4) {
                results.textContent = '';
                var res = JSON.parse(this.responseText);
                filterResults(res);
                total = showGists(res, total);
                document.getElementById('results').textContent = 'Total number' +
                ' of results: ' + total;
            }
        };

        req.open('GET', url);
        req.send();
    }
}

function filterResults(res) {
    var langs = document.getElementsByName('lang');
    filter = [];

    for (var i in langs) {
        if (langs[i].checked) {
            filter.push(langs[i].value);
        }
    }

    if (filter.length < 1) {
        return;
    }
    else {
        for (var i in res) {
            var filtered = true;
            for (var f in res[i].files) {
                if (filter.indexOf(res[i].files[f].language) > -1) {
                    filtered = false;
                    break;
                }
            }
            res[i]['filtered'] = filtered;
        }
    }
}

function showGists(res, total) {
    var results = document.getElementById('resultsDiv');
    for (var gist in res) {
        var id = res[gist].id;
        if (!res[gist].filtered && gistFaves.ids.indexOf(id) < 0) {
            total++;
            var br = document.createElement('br');
            var div = document.createElement('div');
            var link = document.createElement('a');
            var gistID = document.createElement('p');
            gistID.className = 'gistID';
            gistID.textContent = 'Gist ID: ' + res[gist].id;
            var faveButton = document.createElement('input');
            faveButton.type = 'button';
            faveButton.value = 'Save as Favorite';
            faveButton.setAttribute('onClick', 'saveFave("' + id + '")');
            var lang = 'Languages: ';
            for (i in res[gist].files) {
                if (!res[gist].files[i].language) {
                    lang += 'Undefined, ';
                }
                else {
                    lang += res[gist].files[i].language + ', ';
                }
            }
            lang = lang.slice(0, -2);
            var langs = document.createElement('p');
            langs.className = 'langs';
            langs.textContent = lang;
            link.setAttribute('href', res[gist].html_url);
            if (!res[gist].description) {
                link.textContent = 'No Description';
            }
            else {
                link.textContent = res[gist].description;
            }

            div.className = 'gist';
            div.id = res[gist].id;
            div.appendChild(gistID);
            div.appendChild(langs);
            div.appendChild(link);
            div.appendChild(br);
            div.appendChild(faveButton);
            results.appendChild(div);
        }
    }
    return total;
}

function showSavedGists(res, total) {
    var results = document.getElementById('favoritesDiv');
    for (var gist in res) {
        total++;
        var id = res[gist].id;
        var br = document.createElement('br');
        var div = document.createElement('div');
        var link = document.createElement('a');
        var gistID = document.createElement('p');
        gistID.className = 'gistID';
        gistID.textContent = 'Gist ID: ' + res[gist].id;
        var faveButton = document.createElement('input');
        faveButton.type = 'button';
        faveButton.value = 'Delete Favorite';
        faveButton.setAttribute('onClick', 'deleteFave("' + id + '")');
        var lang = res[gist].langs;
        var langs = document.createElement('p');
        langs.className = 'langs';
        langs.textContent = lang;
        link.setAttribute('href', res[gist].html_url);
        link.textContent = res[gist].desc;

        div.className = 'gist';
        div.id = res[gist].id;
        div.appendChild(gistID);
        div.appendChild(langs);
        div.appendChild(link);
        div.appendChild(br);
        div.appendChild(faveButton);
        results.appendChild(div);
    }
    return total;
}

var gistFaves = null;

window.onload = function() {
    total = favorites = 0;
    gistFaves = localStorage.getItem('savedFaves');
    if (!gistFaves) {
        gistFaves = {'gists': [], 'ids': []};
        localStorage.setItem('savedFaves', JSON.stringify(gistFaves));
    }
    else {
        gistFaves = JSON.parse(localStorage.getItem('savedFaves'));
    }
    favorites = showSavedGists(gistFaves.gists, favorites);
    document.getElementById('favorites').textContent = 'Total number of ' +
    'favorites: ' + favorites;
    document.getElementById('results').textContent = 'Total number of results:' +
    ' ' + total;
};

function saveFave(id) {
    var newSave = {};
    var div = document.getElementById(id);
    var saveds = document.getElementById('favoritesDiv');
    saveds.appendChild(div);
    var button = div.getElementsByTagName('input');
    button[0].value = 'Delete favorite';
    button[0].setAttribute('onClick', 'deleteFave("' + id + '")');

    newSave['id'] = id;
    var gistID = div.getElementsByClassName('gistID');
    var langs = div.getElementsByClassName('langs');
    var desc = div.getElementsByTagName('a');
    newSave['id'] = id;
    newSave['gistID'] = gistID[0].textContent;
    newSave['langs'] = langs[0].textContent;
    newSave['desc'] = desc[0].textContent;
    newSave['html_url'] = desc[0].getAttribute('href');

    gistFaves.ids.push(id);
    gistFaves.gists.push(newSave);
    favorites++;
    total--;
    document.getElementById('favorites').textContent = 'Total number of ' +
    'favorites: ' + favorites;
    document.getElementById('results').textContent = 'Total number of results:' +
    ' ' + total;

    localStorage.setItem('savedFaves', JSON.stringify(gistFaves));
}

function deleteFave(id) {
    gistFaves.ids.splice(gistFaves.ids.indexOf(id), 1);
    for (i in gistFaves.gists) {
        if (gistFaves.gists[i].id === id) {
            break;
        }
    }
    gistFaves.gists.splice(i, 1);

    var child = document.getElementById(id);
    var parent = document.getElementById('favoritesDiv');
    parent.removeChild(child);
    favorites--;
    document.getElementById('favorites').textContent = 'Total number of ' +
    'favorites: ' + favorites;

    localStorage.setItem('savedFaves', JSON.stringify(gistFaves));

}
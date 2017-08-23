var key = 0;
var that;
var mapAddress = "";
var mapArr = [];
$(function() {
    init();
    initEvents();
    //createNote('jintian','2017.1.1');
    //createNote('jintian','2017.1.2');

})

function init() {
    var indexedDB = window.indexedDB;
    var request = indexedDB.open('myNotes', 1);
    request.onsuccess = function() {
        var db = this.result;
        var transaction = db.transaction(['notes'], 'readwrite');
        var noteStore = transaction.objectStore('notes');
        cursorStore(noteStore);
        db.close();
    }
    request.onupgradeneeded = function() {
        var db = this.result;
        if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', {
                autoIncrement: true
            });
        }
    }



}

function initEvents() {

    $('#change').click(function() {
        $('#note_page').slideToggle();
    })

    $('#btn_submit').click(function() {
        //console.log(key);
        var note = {
            title: $('#note_title').val(),
            content: $('#note_content').val(),
            date: new Date().toLocaleString() + " ",
            time: new Date().getTime() + " ",
            map: mapAddress
        }
        saveNote(note);
        $('#note_page').slideUp();
        $('#note_title').val("");
        $('#note_content').val("");
        $('#btn_place').text("点击定位");
    })
    $('#note_list > ul').on('click', 'li', function() {
        var indexedDB = window.indexedDB;
        var request = indexedDB.open('myNotes', 1);
        var index = $(this).attr('index');
        that = $(this);
        request.onsuccess = function() {
            var db = this.result;
            var transaction = db.transaction(['notes'], 'readwrite');
            var noteStore = transaction.objectStore('notes');
            getContent(noteStore, index);

            db.close();
        }

    })

    $('#btn_place').click(function() {
        $(this).text("定位中。。。");
        var that = $(this);
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(position) {
            console.log(position);
            var myGeo = new BMap.Geocoder();
            myGeo.getLocation(position.point, function(result) {
                that.text(result.address);
                mapAddress = result.address;
            })
        });
    })
}

function saveNote(note) {
    var indexedDB = window.indexedDB;
    var request = indexedDB.open('myNotes', 1);

    request.onsuccess = function() {
        var db = this.result;
        var transaction = db.transaction(['notes'], 'readwrite');
        var noteStore = transaction.objectStore('notes');
        noteStore.add(note);

        getStore(noteStore, ++key);
        //console.log(noteStore);
        db.close();
    }

    request.onupgradeneeded = function() {
        var db = this.result;
        if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', {
                autoIncrement: true
            });
        }
    }
}

function createNote(title, time, key) {
    var li = document.createElement('li');
    $(li).attr('index', key);
    li.innerHTML = title + '<span>' + time + '</span><div></div><div style="height:200px" id="' + key + 'map"' + '></div>';
    $('#note_list').children().prepend(li);
}

function cursorStore(noteStore) {
    var cursorRequest = noteStore.openCursor();
    cursorRequest.onsuccess = function(e) {
        var cursor = this.result;
        //console.log(cursor.length);

        if (cursor) {
            var currentuser = cursor.value;
            console.log(cursor);
            key = cursor.key;
            //getStore(noteStore,key);
            createNote(currentuser.title, currentuser.date, key);
            cursor.continue();
        }

    }
}

function getStore(noteStore, key) {
    //console.log(11111);

    var getRequest = noteStore.get(key);
    console.log(key);
    getRequest.onsuccess = function(e) {
        //console.log(this.result);
        createNote(this.result.title, this.result.date, key);
    }
}

function getContent(noteStore, index) {
    //console.log(11111);
    //console.log(index);
    index = parseInt(index);
    var getRequest = noteStore.get(index);
    getRequest.onsuccess = function(e) {
        //console.log(this.result.content);
        that.children().eq(1).text(this.result.content);
        if(!mapArr[index]){
          mapLocation(this.result.map, that.children().eq(2).attr("id"));
          mapArr[index] = 1;
        }
        console.log(this.result.map);

        that.children().eq(1).slideToggle().next().slideToggle();

        //return this.result.content;

    }
}

function mapLocation(map_address, mapid) {



    var map = new BMap.Map(mapid);
    map.disableDragging();
    var myGeo = new BMap.Geocoder();
    myGeo.getPoint(map_address, function(point) {
        if (point) {
            console.log(point);

            map.centerAndZoom(point, 15);
            map.addOverlay(new BMap.Marker(point));
        } else {
            alert("您选择地址没有解析到结果!");
        }
    }, '成都市');
}

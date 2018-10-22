// Beispiel zum Doppler-Effekt
// Java-Applet (25.02.1998) umgewandelt
// 10.03.2015 - 16.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel dopplereffect_de.js) abgespeichert.

// Konstanten:

var T = 2;                                                 // Schwingungsdauer (s)
var V = 12;                                                // Geschwindigkeit der Schallquelle (Pixel/s)
var C = 20;                                                // Schallgeschwindigkeit (Pixel/s)

// Farben:

var colorSky = "#00ffff";                                  // Farbe für Himmel
var colorGround = "#c0c0c0";                               // Farbe für Straße
var colorSun = "#ffd000";                                  // Farbe für Sonne
var colorHouse11 = "#ffff00";                              // Farbe für Haus 1 (Mauerwerk)
var colorHouse12 = "#ff0000";                              // Farbe für Haus 1 (Dach)
var colorHouse21 = "#ffc800";                              // Farbe für Haus 2 (Mauerwerk)
var colorHouse22 = "#ff00ff";                              // Farbe für Haus 2 (Dach)
var colorWindow = "#4040ff";                               // Farbe für Fenster
var colorDoor = "#604020";                                 // Farbe für Türen

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Zurück, Pause/Weiter)
var ta;                                                    // Textbereich
var on;                                                    // Flag für Bewegung
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer für Animation
var mx, my;                                                // Koordinaten des Mittelpunkts (Pixel)
var x;                                                     // Position der Schallquelle (Pixel)
var left;                                                  // Flag (Notarztwagen links vom Beobachter)
var arrival;                                               // Flag (Ankunft einer Wellenfront)

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // Rückgabewert
  } 

// Start:
// Seiteneffekt canvas, width, height, ctx, bu1, bu2, t, on, timer, t0, mx, my, left
// Wirkung auf Textbereich

function start () {
  canvas = getElement("cv");                               // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  bu1 = getElement("bu1",text01);                          // Oberer Schaltknopf (Zurück)
  bu2 = getElement("bu2",text02[0]);                       // Unterer Schaltknopf (Pause/Weiter)
  ta = getElement("ta");                                   // Textbereich
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  t = 0;                                                   // Zeitvariable (s)  
  startAnimation();                                        // Animation zunächst angeschaltet  
  mx = width/2; my = height/2+50;                          // Position des Mittelpunkts (Pixel)
  setLeft(true);                                           // Vorbereitungen für Position links vom Beobachter
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf Pause/Weiter
  } // Ende der Methode start
    
// Reaktion auf Resetknopf:
// Seiteneffekt t, left, on, timer, t0
// Wirkung auf Schaltknopf Pause/Weiter und Textbereich
   
function reactionReset () {
  t = 0;                                                   // Zeitvariable zurücksetzen
  setLeft(true);                                           // Vorbereitungen für Position links vom Beobachter
  if (!on) startAnimation();                               // Falls nötig, Animation starten
  bu2.innerHTML = text02[0];                               // Text "Pause" für unteren Schaltknopf
  }
  
// Reaktion auf den Schaltknopf Pause/Weiter:
// Seiteneffekt on, timer, t0
// Wirkung auf Schaltknopf Pause/Weiter

function reactionStart () {
  if (on) stopAnimation();                                 // Falls Animation läuft, stoppen ...
  else startAnimation();                                   // Sonst Animation starten
  bu2.innerHTML = (on ? text02[0] : text02[1]);            // Schaltknopf-Text
  }
    
// Animation starten oder fortsetzen:
// Seiteneffekt on, timer, t0

function startAnimation () {
  on = true;                                               // Animation angeschaltet
  timer = setInterval(paint,40);                           // Timer mit Intervall 0,040 s aktivieren
  t0 = new Date();                                         // Neuer Anfangszeitpunkt 
  }
  
// Animation stoppen:
// Seiteneffekt on, timer

function stopAnimation () {
  on = false;                                              // Animation abgeschaltet
  clearInterval(timer);                                    // Timer deaktivieren
  }
  
// Hilfsroutine: Vorbereitungen für Position links oder rechts vom Beobachter
// l ... Flag für Position links vom Beobachter
// Seiteneffekt left
// Wirkung auf Textbereich

function setLeft (l) {
  left = l;                                                // Flag übernehmen  
  var text = text03[l?0:1];                                // Array der Textzeilen für linke bzw. rechte Seite 
  var s = "";                                              // Neue Zeichenkette (leer)
  for (var i=0; i<text.length; i++) s += text[i]+"\n";     // Zeilen und Zeilenumbrüche hinzufügen
  ta.value = s;                                            // Text in den Textbereich übernehmen
  }
     
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt (Pixel)
// x2, y2 ... Endpunkt (Pixel)

function line (x1, y1, x2, y2) {
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... Höhe (Pixel)
// c ....... Füllfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }

// Kreis zeichnen:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)
// b ....... Flag für schwarzen Rand

function circle (x, y, r, c, b) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Falls Füllfarbe definiert, Kreis ausfüllen ...
  if (b) ctx.stroke();                                     // Falls gewünscht, Kreisrand zeichnen
  }
  
// Haus:
// c1 ... Farbe für Mauer
// c2 ... Farbe für Dach
// x .... Position (Pixel)

function house (c1, c2, x) {
  rectangle(x-45,my-45,95,45,c1);                          // Mauerwerk 
  rectangle(x-50,my-75,105,30,c2);                         // Dach
  for (var i=0; i<4; i++)                                  // Für alle Fenster ...
    if (i != 2)                                            // Fenster zeichnen
      rectangle(x-35+i*20,my-30,15,15,colorWindow); 
  rectangle(x+5,my-30,15,30,colorDoor);                    // Türe zeichnen
  }
  
// Notarztwagen:

function ambulance () {
  ctx.fillStyle = "#ffffff";                               // Füllfarbe weiß
  ctx.fillRect(x-40,my-22,32,17);                          // Linker Teil des Fahrzeugs
  ctx.fillRect(x-9,my-13,9,8);                             // Rechter Teil des Fahrzeugs
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(x-40,my-22);                                  // Anfangspunkt (links oben)
  ctx.lineTo(x-8,my-22);                                   // Linie nach rechts
  ctx.lineTo(x-8,my-13);                                   // Linie nach unten
  ctx.lineTo(x,my-13);                                     // Linie nach rechts
  ctx.lineTo(x,my-5);                                      // Linie nach unten
  ctx.lineTo(x-40,my-5);                                   // Linie nach links
  ctx.lineTo(x-40,my-22);                                  // Linie nach oben (Zurück zum Ausgangspunkt)
  ctx.stroke();                                            // Polygonzug zeichnen
  rectangle(x-17,my-19,6,7,"#0000ff");                     // Fenster
  ctx.fillStyle = "#ff0000";                               // Füllfarbe rot
  ctx.fillRect(x-31,my-15.5,10,4);                         // Rotes Kreuz, waagrechter Balken
  ctx.fillRect(x-28,my-18.5,4,10);                         // Rotes Kreuz, senkrechter Balken
  circle(x-32,my-4,4,"#000000");                           // Linkes Rad 
  circle(x-8,my-4,4,"#000000");                            // Rechtes Rad
  }

// Wellenfronten:
// Seiteneffekt arrival

function circles () {
  arrival = false;                                         // Flag setzen (Wellenfront nicht beim Beobachter)
  for (var i=0; i*T<t; i++) {                              // Für alle Wellenfronten ...
    var x0 = i*V*T;                                        // Mittelpunkt der Wellenfront (Pixel)
    var r = C*(t-i*T);                                     // Radius (Pixel) 
    circle(x0,my-10,r,null,true);                          // Wellenfront zeichnen
    var xFront = (left ? x0+r : x0-r);                     // x-Koordinate der Wellenfront (Pixel)
    if (Math.abs(xFront-mx) < 2) arrival = true;           // Falls Wellenfront beim Beobachter, Flag korrigieren
    }
  }
    
// Person:
// c ....... Farbe
// (x,y) ... Position (Pixel)

function person (c, x, y) {
  circle(x,y-14,3,c);                                      // Kopf
  ctx.beginPath();                                         // Neuer Grafikpfad                                               
  ctx.lineWidth = 1.5;                                     // Liniendicke
  ctx.strokeStyle = c;                                     // Linienfarbe
  line(x,y-12,x-2,y);                                      // Linkes Bein
  line(x,y-12,x+2,y);                                      // Rechtes Bein
  line(x,y-12,x-5,y-5);                                    // Linker Arm
  line(x,y-12,x+5,y-5);                                    // Rechter Arm
  }
  
// Grafikausgabe:
// Seiteneffekt t, t0, x, left, x, arrival 
// Wirkung auf Textbereich 
  
function paint () {
  if (on) {                                                // Falls Animation läuft ...
    var t1 = new Date();                                   // Aktuelle Zeit
    t += (t1-t0)/1000;                                     // Zeitvariable aktualisieren 
    t0 = t1;                                               // Anfangszeitpunkt aktualisieren
    }
  if (t > 60) {                                            // Falls maximale Zeitdauer (60 s) überschritten ...
    t = 0;                                                 // Zeitvariable zurücksetzen 
    x = 0;                                                 // Positionsvariable zurücksetzen  
    setLeft(true);                                         // Vorbereitungen für Position links vom Beobachter
    }
  rectangle(0,0,width,my,colorSky);                        // Himmel
  circle(60,30,10,colorSun,true);                          // Sonne      
  house(colorHouse11,colorHouse12,100);                    // Linkes Haus
  house(colorHouse21,colorHouse22,350);                    // Rechtes Haus
  x = V*t;                                                 // Positionsvariable (Pixel) 
  ambulance();                                             // Notarztwagen
  circles();                                               // Wellenfronten
  person(arrival ? "#ff0000" : "#000000",mx,my);           // Person
  if (left && x > mx)                                      // Falls Fahrzeug am Beobachter vorbeigefahren ist ...
    setLeft(false);                   	                   // ... Vorbereitungen für Position rechts vom Beobachter    
  rectangle(0,my,width,height-my,colorGround);             // Straße
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen





// Reflexion und Brechung von Lichtwellen (Huygens-Prinzip)
// Java-Applet (05.03.1998) umgewandelt
// 19.10.2014 - 21.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel refractionhuygens_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorMedium1 = "#ffff00";                              // Farbe f�r optisch d�nneres Medium
var	colorMedium2 = "#80ffff";                              // Farbe f�r optisch dichteres Medium
var colorIncidence = "#000000";                            // Farbe f�r Einfallswinkel
var colorReflection = "#0000ff";                           // Farbe f�r Reflexionswinkel
var colorRefraction = "#ff0000";                           // Farbe f�r Brechungswinkel
var colorCenter = "#ff00ff";                               // Farbe f�r Wellenzentren

// Konstanten:

var PI2 = 2*Math.PI;                                       // Abk�rzung f�r 2 pi
var DEG = Math.PI/180;                                     // 1 Grad (Bogenma�)
var T = 2.5;                                               // Schwingungsdauer (s)
var c = 20;                                                // Vakuum-Lichtgeschwindigkeit (Pixel/s)
var nr = 19;                                               // Zahl der Wellenzentren (ungerade!) 
var nrSteps = 5;                                           // Zahl der Teilschritte
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2, bu3;                                         // Schaltkn�pfe
var ip1, ip2, ip3;                                         // Eingabefelder
var ta;                                                    // Textbereich

var mx, my;                                                // Mittelpunkt (Pixel)    
var on;                                                    // Flag f�r Bewegung
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Zeitvariable (s)
var x0;                                                    // Bezugspunkt auf der Grenzlinie (f�r schr�gen Einfall, Pixel)
var n1, n2;                                                // Brechungsindizes
var c1, c2;                                                // Phasengeschwindigkeiten (Pixel/s)
var lambda1, lambda2;                                      // Wellenl�ngen (Pixel)
var eps1, eps2;                                            // Einfalls- und Brechungswinkel (Bogenma�)
var sin1, cos1, tan1;                                      // Trigonometrische Werte f�r eps1
var sin2, cos2, tan2;                                      // Trigonometrische Werte f�r eps2
var total;                                                 // Flag f�r Totalreflexion
var dx;                                                    // Abstand der Wellenfronten (waagrecht, Pixel)
var step;                                                  // Nummer des Teilschritts (0 bis 4)

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Neustart)
  bu2 = getElement("bu2",text02);                          // Schaltknopf (N�chster Schritt)
  bu2.disabled = false;                                    // Schaltknopf zun�chst aktiviert
  bu3 = getElement("bu3",text03[0]);                       // Schaltknopf (Pause/Weiter)
  bu3.state = 1;                                           // Anfangszustand (Animation)
  getElement("ip1a",text04);                               // Erkl�render Text (1. Brechungsindex)
  ip1 = getElement("ip1b");                                // Eingabefeld (1. Brechungsindex)
  getElement("ip2a",text05);                               // Erkl�render Text (2. Brechungsindex)
  ip2 = getElement("ip2b");                                // Eingabefeld (2. Brechungsindex)
  getElement("ip3a",text06);                               // Erkl�render Text (Einfallswinkel)
  ip3 = getElement("ip3b");                                // Eingabefeld (Einfallswinkel)
  getElement("ip3c",degree);                               // Einheit (Einfallswinkel)
  ta = getElement("ta");                                   // Textbereich (Erl�uterungen)
  ta.readOnly = true;                                      // Textbereich nicht beschreibbar
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
    
  mx = width/2; my = height/2;                             // Koordinaten des Mittelpunkts (Pixel) 
  n1 = 1; n2 = 2;                                          // Defaultwerte f�r Brechungsindizes
  eps1 = 45*DEG;                                           // Defaultwert f�r Einfallswinkel
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen
  step = 0;                                                // Anfang der Erl�uterungen
  updateText();                                            // Erl�uterung aktualisieren
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  newAnimation();                                          // Neue Animation
  bu1.onclick = reactionButton1;                           // Reaktion auf Schaltknopf (Neustart)
  bu2.onclick = reactionButton2;                           // Reaktion auf Schaltknopf (N�chster Schritt)
  bu3.onclick = reactionButton3;                           // Reaktion auf Schaltknopf (Pause/Weiter)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (1. Brechungsindex)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (2. Brechungsindex)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Einfallswinkel)
  }
  
// Reaktion auf den Schaltknopf "Neustart":
// Seiteneffekt step, n1, n2, eps1, bu2, c1, c2, lambda1, lambda2, sin1, cos1, tan1, sin2, cos2, tan2, total, x0, dx, t0, t, on, bu3

function reactionButton1 () {
  step = 0;                                                // Erl�uterungen neu starten
  reaction();                                              // Eingabe, Berechnungen, neue Animation
  updateText();                                            // Erl�uterung aktualisieren
  }
  
// Reaktion auf den Schaltknopf "N�chster Schritt":
// Seiteneffekt step, n1, n2, eps1, bu2, c1, c2, lambda1, lambda2, sin1, cos1, tan1, sin2, cos2, tan2, total, x0, dx, t0, t, on, bu3
  
function reactionButton2 () {
  if (step < nrSteps-1) step++;                            // Falls m�glich, n�chster Schritt
  reaction();                                              // Eingabe, Berechnungen, neue Animation
  updateText();                                            // Erl�uterung aktualisieren
  }
  
// Reaktion auf den Schaltknopf "Pause/Weiter":
// Seiteneffekt bu3, on

function reactionButton3 () {
  bu3.state = 3-bu3.state;                                 // Zustand des Schaltknopfs �ndern
  bu3.innerHTML = text03[bu3.state-1];                     // Text des Schaltknopfs �ndern
  on = (bu3.state == 1);                                   // Flag f�r Animation setzen oder l�schen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt n1, n2, eps1, bu2, c1, c2, lambda1, lambda2, sin1, cos1, tan1, sin2, cos2, tan2, total, x0, dx, t0, t, on, bu3, 
// Wirkung auf Eingabefelder und Textbereich
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13) {                                    // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen, rechnen, neue Animation
    updateText();                                          // ... Erl�uterung aktualisieren
    }                          
  }
  
// Textbereich aktualisieren:
// nr ... Index im Array text07 (Erl�uterungen)
  
function setText (nr) {
  var t = text07[nr];                                      // Array der Zeilen der passenden Erl�uterung 
  var s = "";                                              // Neue Zeichenkette (leer)
  for (var i=0; i<t.length; i++) s += t[i]+"\n";           // Zeilen und Zeilenumbr�che hinzuf�gen
  ta.value = s;                                            // Text in den Textbereich �bernehmen
  }
  
// Textbereich aktualisieren:
  
function updateText () {
  if (n1 == n2) setText(9);                                // Text f�r gleiche Brechungsindizes
  else switch (step) {                                     // Bei ungleichen Brechungsindizes je nach Schritt ...
    case 0:                                                // Schritt 0 (einzelne Wellenfront) 
      if (eps1 > 0) setText(0);                            // Text f�r schr�gen Einfall
      else if (eps1 == 0) setText(1);                      // Text f�r senkrechten Einfall
      break;
    case 1:                                                // Schritt 1 (Elementarwellen)
      if (n1 > n2) setText(2);                             // Text f�r �bergang ins optisch d�nnere Medium
      else setText(3);                                     // Text f�r �bergang ins optisch dichtere Medium
      break;
    case 2:                                                // Schritt 2 (neue Wellenfronten)
      if (!total && eps1 > 0) setText(4);                  // Text f�r Brechung bei schr�gem Einfall
      else if (!total && eps1 == 0) setText(5);            // Text f�r �bergang bei senkrechtem Einfall
      else if (total) setText(6);                          // Text f�r Totalreflexion
      break;
    case 3:                                                // Schritt 3 (Wellenstrahlen)
      setText(7); break;                                   // Text
    case 4:                                                // Schritt 4 (viele Wellenfronten)
      setText(8); break;                                   // Text
    }
  ta.setSelectionRange(0,0);                               // Zum Textanfang zur�ckscrollen
  ta.blur();                                               // Fokus abgeben
  }
   
//-------------------------------------------------------------------------------------------------

// Berechnungen:
// Seiteneffekt c1, c2, lambda1, lambda2, sin1, cos1, tan1, sin2, cos2, tan2, total, x0, dx

function calculation () {
  c1 = c/n1; c2 = c/n2;                                    // Schallgeschwindigkeiten in den beiden Medien (Pixel/s)
  lambda1 = c1*T; lambda2 = c2*T;                          // Wellenl�ngen in den beiden Medien (Pixel)
  sin1 = Math.sin(eps1); cos1 = Math.cos(eps1);            // Sinus und Cosinus des Einfallswinkels 
  if (cos1 != 0) tan1 = sin1/cos1;                         // Tangens des Einfallswinkels
  sin2 = n1*sin1/n2;                                       // Sinus des Brechungswinkels 
  total = (sin2 > 1);                                      // Flag f�r Totalreflexion
  if (!total) {                                            // Falls keine Totalreflexion ...
    eps2 = Math.asin(sin2);                                // Brechungswinkel (Bogenma�)
    cos2 = Math.cos(eps2);                                 // Cosinus des Brechungswinkels
    if (cos2 != 0) tan2 = sin2/cos2;                       // Tangens des Brechungswinkels
    }
  if (eps1 > 0) {x0 = -my/tan1; dx = lambda1/sin1;}        // Falls schr�ger Einfall, ???
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl
// Wirkung auf Eingabefeld
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt n1, n2, eps2, Wirkung auf Eingabefelder

function input () {
  n1 = inputNumber(ip1,2,true,1,10);                       // 1. Brechungsindex
  n2 = inputNumber(ip2,2,true,1,10);                       // 2. Brechungsindex
  eps1 = DEG*inputNumber(ip3,1,true,0,89.9);               // Einfallswinkel (Grad)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(n1,2,true);                         // Eingabefeld f�r 1. Brechungsindex
  ip2.value = ToString(n2,2,true);                         // Eingabefeld f�r 2. Brechungsindex
  ip3.value = ToString(eps1/DEG,1,true);                   // Eingabefeld f�r Einfallswinkel
  }
  
// Eingabe und Berechnungen:
// Seiteneffekt n1, n2, eps1, bu2, c1, c2, lambda1, lambda2, sin1, cos1, tan1, sin2, cos2, tan2, total, x0, dx, t0, t, on, bu3

function reaction () {
  input();                                                 // Eingabe
  bu2.disabled = (step >= nrSteps-1 || n1 == n2);          // Schaltknopf "N�chster Schritt" (de-)aktivieren
  calculation();                                           // Berechnungen
  newAnimation();                                          // Animation neu starten
  }
  
// Animation neu starten:
// Seiteneffekt t0, t, on, bu3

function newAnimation () {
  t0 = new Date();                                         // Neuer Anfangszeitpunkt
  t = 0;                                                   // Zeitvariable zur�cksetzen
  on = true;                                               // Flag f�r Bewegung
  bu3.state = 1;                                           // Schaltknopf "Pause/Weiter" im Zustand "Animation"
  bu3.innerHTML = text03[0];                               // Text "Pause" f�r Schaltknopf
  }
    
//------------------------------------------------------------------------------------------------- 

// Neuer Grafikpfad (Standardwerte):

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function line (x1, y1, x2, y2, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze         
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (length < 5) return;                                  // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.lineWidth = 1;                                       // Liniendicke zur�cksetzen
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Kreisscheibe mit schwarzem Rand zeichnen:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// x, y ... Scheitel
// r ...... Radius
// a0 ..... Startwinkel (Bogenma�)
// a ...... Winkelbetrag (Bogenma�)
// c ...... F�llfarbe 

function angle (x, y, r, a0, a, c) {
  newPath();                                               // Neuer Pfad
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,PI2-a0,PI2-a0-a,true);                     // Kreisbogen
  ctx.closePath();                                         // Zur�ck zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausf�llen, Rand zeichnen
  }
  
// Ausgerichteter Text:
// s ....... Zeichenkette
// (x,y) ... Position (Pixel)
// t ....... Ausrichtung (0 f�r linksb�ndig, 1 f�r zentriert, 2 f�r rechtsb�ndig)

function alignText (s, x, y, t) {
  if (t == 0) ctx.textAlign = "left";                      // Ausrichtung entweder linksb�ndig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsb�ndig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }  

// Medien zeichnen (mit Beschriftung):

function medium12 () {
  ctx.fillStyle = (n1<=n2 ? colorMedium1 : colorMedium2);  // Farbe f�r oberes Medium
  ctx.fillRect(0,0,width,my);                              // Oberes Medium zeichnen
  ctx.fillStyle = (n1<n2 ? colorMedium2 : colorMedium1);   // Farbe f�r unteres Medium
  ctx.fillRect(0,my,width,my);                             // Unteres Medium zeichnen    
  line(0,my,width,my);                                     // Grenzfl�che zeichnen
  ctx.fillStyle = "#000000";                               // Farbe schwarz f�r Beschriftung
  alignText(text11,20,my-10,0);                            // Beschriftung Medium 1
  alignText(text12,20,my+20,0);                            // Beschriftung Medium 2
  var s = text08+"   "+stringAngle(eps1);                  // Zeichenkette f�r Einfallswinkel (Grad)
  ctx.fillStyle = colorIncidence;                          // Farbe f�r Einfallswinkel
  alignText(s,20,20,0);                                    // Zeichenkette ausgeben
  }

// Wellenfront f�r einfallende Welle:
// x ... Waagrechte Koordinate des Punktes auf der Grenzfl�che (Pixel)

function front0 (x) {
  if (eps1 > 0) {                                          // Falls schr�ger Einfall ... 
    var a = (mx-x)*sin1*cos1;                              // Hilfsgr��e
    var xZ = x+a/tan1, yZ = my-a;                          // Mittelpunkt der Wellenfront (Pixel)
    var x0 = xZ-500*cos1, y0 = yZ+500*sin1;                // Linkes Ende der Wellenfront (au�erhalb der Zeichnung)
    if (x0 < x) {x0 = x; y0 = my;}                         // Korrektur, falls n�tig: Linkes Ende auf der Grenzfl�che
    var x1 = xZ+500*cos1, y1 = yZ-500*sin1;                // Rechtes Ende der Wellenfront (au�erhalb der Zeichnung)  
    if (x < width) line(x0,y0,x1,y1,colorIncidence);       // Falls innerhalb der Zeichnung, Wellenfront zeichnen
    }
  else {                                                   // Falls senkrechter Einfall ...
    var y0 = x;                                            // y-Koordinate �bernehmen
    if (y0 < my) line(0,y0,width,y0,colorIncidence);       // Falls innerhalb der Zeichnung, Wellenfront zeichnen
    }   
  }
  
// Wellenfront f�r reflektierte Welle:
// x ... Waagrechte Koordinate des Punktes auf der Grenzfl�che (Pixel)

function front1 (x) {
  if (eps1 > 0) {                                          // Falls schr�ger Einfall ...
    var a = (mx-x)*sin1*cos1;                              // Hilfsgr��e
    var xZ = x+a/tan1, yZ = my+a;                          // Mittelpunkt der Wellenfront (Pixel)
    var x0 = xZ-500*cos1, y0 = yZ-500*sin1;                // Linkes Ende der Wellenfront (au�erhalb der Zeichnung)
    var x1 = xZ+500*cos1, y1 = yZ+500*sin1;                // Rechtes Ende der Wellenfront (au�erhalb der Zeichnung)
    if (x1 > x) {x1 = x; y1 = my;}                         // Korrektur, falls n�tig: Rechtes Ende auf der Grenzfl�che
    if (x > 0) line(x0,y0,x1,y1,colorReflection);          // Falls innerhalb der Zeichnung, Wellenfront zeichnen 
    }
  else {                                                   // Falls senkrechter Einfall ...
    var y0 = 2*my-x;                                       // y-Koordinate �bernehmen
    if (y0 > 0 && y0 < my)                                 // Falls innerhalb der Zeichnung ... 
      line(0,y0,width,y0,colorReflection);                 // Wellenfront zeichnen
    }   
  }
  
// Wellenfront f�r gebrochene Welle:
// x ... Waagrechte Koordinate des Punktes auf der Grenzfl�che (Pixel)

function front2 (x) {
  if (total) return;                                       // Falls Totalreflexion, abbrechen
  if (eps1 > 0) {                                          // Falls schr�ger Einfall ...
    var a = (x-mx)*sin2*cos2;                              // Hilfsgr��e 
    var xZ = (cos2!=0 ? x-a/tan2 : x), yZ = my+a;          // Mittelpunkt der Wellenfront (Pixel)
    var x0 = xZ-500*cos2, y0 = yZ+500*sin2;                // Linkes Ende der Wellenfront (au�erhalb der Zeichnung)
    var x1 = xZ+500*cos2, y1 = yZ-500*sin2;                // Rechtes Ende der Wellenfront (au�erhalb der Zeichnung)
    if (x1 > x || x0 == x1) {x1 = x; y1 = my;}             // Korrektur, falls n�tig: Rechtes Ende auf der Grenzfl�che
    if (x > 0) line(x0,y0,x1,y1,colorRefraction);          // Falls innerhalb der Zeichnung, Wellenfront zeichnen
    }
  else {                                                   // Falls senkrechter Einfall ...
    var y0 = my+c2*(x-my)/c1;                              // y-Koordinate berechnen
    if (y0 > my) line(0,y0,width,y0,colorRefraction);      // Falls innerhalb der Zeichnung, Wellenfront zeichnen
    }
  }
  
// Kreiswelle im Medium 1 (oberer Halbkreis):
// x0 ... Waagrechte Koordinate des Zentrums (Pixel)
// x .... Waagrechte Koordinate des Bezugspunktes (Schnitt von Wellenfront und Grenzfl�che)

function circle1 (x0, x) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorReflection;                       // Farbe f�r reflektierte Welle
  var r = (eps1>0 ? (x-x0)*lambda1/dx : x-my);             // Radius (Pixel)
  if (r > 0) ctx.arc(x0,my,r,0,Math.PI,true);              // Halbkreis vorbereiten, falls sinnvoll
  ctx.stroke();                                            // Halbkreis zeichnen
  }

// Kreiswelle im Medium 2 (unterer Halbkreis):
// x0 ... Waagrechte Koordinate des Zentrums (Pixel)
// x .... Waagrechte Koordinate des Bezugspunktes (Schnitt von Wellenfront und Grenzfl�che)

function circle2 (x0, x) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorRefraction;                       // Farbe f�r gebrochene Welle
  var r = (eps1>0 ? (x-x0)*lambda2/dx : c2*(x-my)/c1);     // Radius (Pixel)
  if (r > 0) ctx.arc(x0,my,r,Math.PI,2*Math.PI,true);      // Halbkreis vorbereiten, falls sinnvoll
  ctx.stroke();                                            // Halbkreis zeichnen
  }
      
// Grafik-Ausgabe f�r step >= 1:
// (Elementarwellen mit ihren Zentren)
// x ... Waagrechte Koordinate des Bezugspunktes auf der Grenzfl�che (Pixel)
      
function paintStep1 (x) {
  var dx = width/nr;                                       // Abstand benachbarter Wellenzentren (Pixel)
  for (var i=0; i<nr; i++) {                               // F�r alle Wellenzentren ...
    var xM = (i+0.5)*dx;                                   // Waagrechte Koordinate des Wellenzentrums (Pixel)
    circle(xM,my,2.5,colorCenter);                         // Wellenzentrum markieren
    circle1(xM,x);                                         // Elementarwelle in Medium 1 (oberer Halbkreis) 
    circle2(xM,x);                                         // Elementarwelle in Medium 2 (unterer Halbkreis)
    }
  }
  
// Zeichenkette f�r Winkel in Grad:
// a ... Winkel (Bogenma�)
  
function stringAngle (a) {
  var s = Number(a/DEG).toFixed(1)+" "+degreeUnicode;      // Gerundeter Wert mit Einheit
  return s.replace(".",decimalSeparator);                  // Eventuell Komma statt Punkt
  }
  
// Grafik-Ausgabe f�r step >= 2:
// (Angaben von Einfalls-, Reflexions-, Brechungs- und Grenzwinkel)
// x ... Waagrechte Koordinate des Bezugspunktes auf der Grenzfl�che (Pixel)
    
function paintStep2 (x) {
  if (n1 > n2) {                                           // Falls �bergang ins optisch d�nnere Medium ...
    ctx.fillStyle = colorIncidence;                        // Farbe f�r einfallende Welle
    alignText("("+text13[0],20,45,0);                      // Angabe des Grenzwinkels, erste Zeile
    var epsTR = Math.asin(n2/n1);                          // Grenzwinkel der Totalreflexion (Bogenma�)
    var s = text13[1]+"     "+stringAngle(epsTR)+")";      // Zeichenkette f�r zweite Zeile
    alignText(s,20,65,0);                                  // Angabe des Grenzwinkels, zweite Zeile
    }
  s = text09+"     "+stringAngle(eps1);                    // Zeichenkette f�r Reflexionswinkel  
  ctx.fillStyle = colorReflection;                         // Farbe f�r reflektierte Welle
  alignText(s,width-20,20,2);                              // Angabe des Reflexionswinkels  
  s = text10+"     ";                                      // Zeichenkette f�r Brechungswinkel (unvollst�ndig)
  if (!total) s += stringAngle(eps2);                      // Erg�nzung f�r den Fall der Brechung
  else s += "\u2013\u2013\u2013";                          // Erg�nzung f�r den Fall der Totalreflexion
  ctx.fillStyle = colorRefraction;                         // Farbe f�r gebrochene Welle
  alignText(s,width-20,height-10,2);                       // Angabe des Brechungswinkels
  front1(x); front2(x);                                    // Wellenfronten in Medium 1 und Medium 2
  }
  
// Grafik-Ausgabe f�r step >= 3 (Wellenstrahlen, Einfallslot):

function paintStep3 () {
  var r1 = 500, r2 = 80, r3 = 92;                          // Hilfsgr��en
  if (eps1 < 0.1) {r2 -= 10; r3 += 10;}                    // Korrektur f�r senkrechten Einfall
  var x0 = mx-r1*sin1, y0 = my-r1*cos1;                    // Anfangspunkt des einfallenden Strahls
  var x1 = mx-r2*sin1, y1 = my-r2*cos1;                    // Position der Pfeilspitze (einfallender Strahl)   
  ctx.strokeStyle = colorIncidence;                        // Farbe f�r einfallende Welle                         
  arrow(x0,y0,x1,y1);                                      // Pfeil f�r einfallende Welle
  line(x1,y1,mx,my,colorIncidence);                        // Verl�ngerung des Pfeils bis zum Mittelpunkt
  angle(mx,my,20,90*DEG,eps1,colorIncidence);              // Einfallswinkel hervorheben
  x0 = mx+r1*sin1; y0 = my-r1*cos1;                        // Endpunkt des reflektierten Strahls     
  x1 = mx+r3*sin1; y1 = my-r3*cos1;                        // Position der Pfeilspitze 
  ctx.strokeStyle = colorReflection;                       // Farbe f�r reflektierte Welle     
  arrow(mx,my,x1,y1);                                      // Pfeil f�r reflektierte Welle
  line(x1,y1,x0,y0,colorReflection);                       // Verl�ngerung des Pfeils
  angle(mx,my,20,90*DEG-eps1,eps1,colorReflection);        // Reflexionswinkel hervorheben
  if (!total) {                                            // Falls keine Totalreflexion ...
    x0 = mx+r1*sin2; y0 = my+r1*cos2;                      // Endpunkt des gebrochenen Strahls
    x1 = mx+r3*sin2; y1 = my+r3*cos2;                      // Position der Pfeilspitze
    ctx.strokeStyle = colorRefraction;                     // Farbe f�r gebrochene Welle
    arrow(mx,my,x1,y1);                                    // Pfeil f�r gebrochene Welle
    line(x1,y1,x0,y0,colorRefraction);                     // Verl�ngerung des Pfeils
    angle(mx,my,20,270*DEG,eps2,colorRefraction);          // Brechungswinkel hervorheben
    }
  line(mx,0,mx,height);                                    // Einfallslot
  }
  
// Grafik-Ausgabe f�r step == 4 (viele Wellenfronten):
// x ... Waagrechte Koordinate des Bezugspunktes auf der Grenzfl�che (Pixel)
    
function paintStep4 (x) {
  var dx1 = width/nr;                                      // Abstand benachbarter Wellenzentren (Pixel)
  var dx2 = (eps1>0 ? lambda1/sin1 : lambda1);             // Hilfsgr��e
  for (var j=1; j<=10; j++) {                              // F�r alle nachfolgenden Wellenfronten ...
    var xRef = x-j*dx2;                                    // Bezugspunkt auf der Grenzfl�che, waagrechte Koordinate
    front0(xRef);                                          // Einfallende Wellenfront zeichnen
    front1(xRef);                                          // Reflektierte Wellenfront zeichnen
    front2(xRef);                                          // Gebrochene Wellenfront zeichnen
    for (var i=0; i<nr; i++) {                             // F�r alle Wellenzentren (Elementarwellen) ...
      var xM = (i+0.5)*dx1;                                // Waagrechte Koordinate des Zentrums 
      circle1(xM,xRef);                                    // Elementarwelle in Medium 1 (oberer Halbkreis) 
      circle2(xM,xRef);                                    // Elementarwelle in Medium 2 (unterer Halbkreis)
      }
    }   	
  }

// Zeichenfl�che aktualisieren:

function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  ctx.font = FONT;                                         // Zeichensatz
  medium12();                                              // Medien zeichnen
  var t1 = new Date();                                     // Neuer Zeitpunkt
  var dt = (t1-t0)/1000;                                   // Seit dem Anfangszeitpunkt vergangene Zeit (s)
  if (on) t += dt;                                         // Zeitvariable aktualisieren
  t0 = t1;                                                 // Neuer Anfangszeitpunkt
  var x = (eps1>0 ? x0+t*dx/T : c1*t);                     // Bezugspunkt auf der Grenzfl�che (Pixel)
  front0(x);                                               // Einfallende Wellenfront 
  if (n2 == n1) {front2(x); return;}                       // Im trivialen Fall nur Wellenfront in Medium 2 hinzuf�gen 
  if (step == 0) return;                                   // Abbrechen, falls Schritt 0
  paintStep1(x);                                           // Elementarwellen und zugeh�rige Zentren
  if (step == 1) return;                                   // Abbrechen, falls Schritt 1     
  paintStep2(x);                                           // Winkelangaben
  if (step == 2) return;                                   // Abbrechen, falls Schritt 2 
  paintStep3();                                            // Wellenstrahlen und Einfallslot
  if (step == 3) return;                                   // Abbrechen, falls Schritt 3
  paintStep4(x);                                           // Viele Wellenfronten
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


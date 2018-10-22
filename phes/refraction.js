// Reflexion und Brechung von Licht
// Java-Applet (20.12.1997) umgewandelt
// 17.10.2014 - 21.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel refraction_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorMedium1 = "#ffffff";                              // Farbe für optisch dünneres Medium
var colorMedium2 = "#00ffff";                              // Farbe für optisch dichteres Medium
var colorRay = "#ff0000";                                  // Farbe für Lichtstrahlen
var colorIncidence = "#000000";                            // Farbe für Einfallswinkel
var colorReflection = "#0000ff";                           // Farbe für Reflexionswinkel
var colorRefraction = "#ff0000";                           // Farbe für Brechungswinkel

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var DEG = Math.PI/180;                                     // Grad (Bogenmaß)
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var r = 200;                                               // Länge der Lichtstrahlen (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ch1, ch2;                                              // Auswahlfelder
var ip1, ip2, ip3;                                         // Eingabefelder
var lb1, lb2, lb3, lb3a, lb3b, lb3c;                       // Ausgabefelder
var nMedia;                                                // Zahl der Medien in der Auswahlliste
var nr1, nr2;                                              // Nummern der Medien 
var n1, n2;                                                // Brechungsindizes
var eps1;                                                  // Einfallswinkel (Bogenmaß)
var eps2;                                                  // Brechungswinkel (Bogenmaß)
var epsTR;                                                 // Grenzwinkel der Totalreflexion (Bogenmaß)
var refr;                                                  // Flag für Brechung
var mx, my;                                                // Koordinaten des Übergangs ins andere Medium
var active;                                                // Flag für Zugmodus

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // Rückgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  nMedia = text07.length;                                  // Zahl der Medien in der Auswahlliste
  nr1 = 1; nr2 = 2;                                        // Default-Medien (Luft, Wasser) 
  ch1 = getElement("ch1");                                 // Auswahlliste (1. Medium, leer)
  initSelect(ch1);                                         // Liste aufbauen
  ch1.selectedIndex = nr1;                                 // Auswahl Luft
  ch2 = getElement("ch2");                                 // Auswahlliste (2. Medium, leer)
  initSelect(ch2);                                         // Liste aufbauen
  ch2.selectedIndex = nr2;                                 // Auswahl Wasser
  getElement("ip1a",text01);                               // Erklärender Text (1. Brechungsindex)     
  ip1 = getElement("ip1b");                                // Eingabefeld (1. Brechungsindex)
  getElement("ip2a",text02);                               // Erklärender Text (2. Brechungsindex)    
  ip2 = getElement("ip2b");                                // Eingabefeld (2. Brechungsindex)
  getElement("ip3a",text03);                               // Erklärender Text (Einfallswinkel)
  ip3 = getElement("ip3b");                                // Eingabefeld (Einfallswinkel in Grad)
  getElement("ip3c",degree);                               // Einheit (Einfallswinkel)
  getElement("op1a",text04);                               // Erklärender Text (Reflexionswinkel)
  lb1 = getElement("op1b");                                // Ausgabefeld (Reflexionswinkel in Grad)
  getElement("op1c",degree);                               // Einheit (Reflexionswinkel)
  getElement("op2a",text05);                               // Erklärender Text (Brechungswinkel)
  lb2 = getElement("op2b");                                // Ausgabefeld (Brechungswinkel in Grad)
  getElement("op2c",degree);                               // Einheit (Brechungswinkel)
  lb3 = getElement("op3c");                                // Ausgabefeld (Grenzwinkel der Totalreflexion in Grad)
  lb3a = getElement("op3a");                               // Erklärender Text (Grenzwinkel, erste Zeile)
  lb3b = getElement("op3b");                               // Erklärender Text (Grenzwinkel, zweite Zeile)
  lb3c = getElement("op3d");                               // Einheit (Grad) für Grenzwinkel 
  getElement("author",author);                             // Autor (und Übersetzer)

  n1 = Number(text07[nr1][1]);                             // Defaultwert 1. Brechungsindex (Luft) 
  n2 = Number(text07[nr2][1]);                             // Defaultwert 2. Brechungsindex (Wasser)
  eps1 = 30*DEG;                                           // Defaultwert Einfallswinkel (Bogenmaß)
  my = height/2;                                           // y-Koordinate für Übergang (Pixel)
  active = false;                                          // Zugmodus abgeschaltet
  updateInput();                                           // Eingabefelder aktualisieren
  reaction();                                              // Rechnung, Ausgabe, neu zeichnen
  
  ch1.onchange = reactionSelect1;                          // Reaktion auf Auswahl (1. Medium)
  ch2.onchange = reactionSelect2;                          // Reaktion auf Auswahl (2. Medium)
  ip1.onkeydown = reactionEnter1;                          // Reaktion auf Eingabe (1. Brechungsindex)
  ip2.onkeydown = reactionEnter2;                          // Reaktion auf Eingabe (2. Brechungsindex)
  ip3.onkeydown = reactionEnter3;                          // Reaktion auf Eingabe (Einfallswinkel)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers   
  } // Ende der Methode start
  
// Initialisierung einer Auswahlliste:
// ch ... Auswahlliste
  
function initSelect (ch) {
  for (var i=0; i<nMedia; i++) {                           // Für alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = text07[i][0];                                 // Text des Elements übernehmen 
    ch.add(o);                                             // Element zur Liste hinzufügen
    }
  }
  
// Reaktion auf Auswahl in der ersten Liste:
// Seiteneffekt nr1, n1, eps2, refr, epsTR, Wirkung auf Ein- und Ausgabefelder

function reactionSelect1 () {
  nr1 = ch1.selectedIndex;                                 // Nummer des Mediums in der Auswahlliste
  var m = (nr1 < nMedia-1);                                // Flag für definiertes Medium
  if (m) n1 = Number(text07[nr1][1]);                      // Brechungsindex
  updateInput();                                           // Aktualisierung der Eingabefelder
  reaction();                                              // Berechnungen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Auswahl in der zweiten Liste:
// Seiteneffekt nr2, n2, eps2, refr, epsTR, Wirkung auf Ein- und Ausgabefelder

function reactionSelect2 () {
  nr2 = ch2.selectedIndex;                                 // Nummer des Mediums in der Auswahlliste
  var m = (nr2 < nMedia-1);                                // Flag für definiertes Medium
  if (m) n2 = Number(text07[nr2][1]);                      // Brechungsindex
  updateInput();                                           // Aktualisierung der Eingabefelder
  reaction();                                              // Berechnungen, Ausgabe, neu zeichnen
  }
    
// Reaktion auf Eingabe mit Enter-Taste (1. Brechungsindex):
// Seiteneffekt n1, n2, eps1, eps2, refr, epsTR, Wirkung auf erste Auswahlliste, Ein- und Ausgabefelder
  
function reactionEnter1 (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13) {                                    // Falls Entertaste (Chrome) ...
    nr1 = ch1.selectedIndex = nMedia-1;                    // Letzter Index der Auswahlliste
    input();                                               // Eingabe
    reaction();                                            // Berechnungen, Ausgabe, neu zeichnen
    }                      
  }
  
// Reaktion auf Eingabe mit Enter-Taste (2. Brechungsindex):
// Seiteneffekt n1, n2, eps1, eps2, refr, epsTR, Wirkung auf zweite Auswahlliste, Ein- und Ausgabefelder
  
function reactionEnter2 (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13) {                                    // Falls Entertaste (Chrome) ...
    nr2 = ch2.selectedIndex = nMedia-1;                    // Letzter Index der Auswahlliste
    input();                                               // Eingabe
    reaction();                                            // Berechnungen, Ausgabe, neu zeichnen
    }                      
  }
  
// Reaktion auf Eingabe mit der Enter-Taste (Einfallswinkel):
// Seiteneffekt n1, n2, eps1, eps2, refr, epsTR, Wirkung auf Ein- und Ausgabefelder
  
function reactionEnter3 (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13) {                                    // Falls Entertaste (Chrome) ...
    input();                                               // Eingabe
    reaction();                                            // Berechnungen, Ausgabe, neu zeichnen
    }
  }
  
// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Eventuell Zugmodus aktivieren                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {
  var obj = e.changedTouches[0];
  reactionDown(obj.clientX,obj.clientY);                   // Eventuell Zugmodus aktivieren      
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  active = false;                                          // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) {             
  active = false;                                          // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Reaktion auf Mausklick oder Berührung:

function reactionDown (x, y) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  x -= re.left; y -= re.top;                               // Koordinaten bezüglich Zeichenfläche
  if (Math.abs(x-mx) < 120 && Math.abs(y-my) < 120)        // Falls Position im Bereich des Experiments ... 
    active = true;                                         // ... Flag für Zugmodus setzen
  }
    
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt eps1, eps2, refr, epsTR, Wirkung auf Ein- und Ausgabefelder 

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  if (u <= mx && v > my) v = my;                           // Falls Mauszeiger links unten, Einfallswinkel 90°
  else if (u > mx && v <= my) u = mx;                      // Falls Mauszeiger rechts oben, Einfallswinkel 0°
  else if (u > mx && v > my) return;                       // Falls Mauszeiger rechts unten abbrechen (sinnlos)
  eps1 = Math.atan2(mx-u,my-v);                            // Einfallswinkel (Bogenmaß)
  ip3.value = ToString(eps1/DEG,1,true);                   // Eingabefeld aktualisieren
  calculation();                                           // Berechnungen
  updateOutput();                                          // Ausgabefelder aktualisieren
  paint();                                                 // Neu zeichnen
  }

//-------------------------------------------------------------------------------------------------

// Berechnungen:
// Seiteneffekt eps2, refr, epsTR

function calculation () {
  eps2 = angleRefraction(eps1);                            // Brechungswinkel (Bogenmaß)
  refr = (eps2 != undefined);                              // Flag für Brechung
  epsTR = (n1>n2 ? Math.asin(n2/n1) : undefined);          // Grenzwinkel der Totalreflexion (Bogenmaß)
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Nachkommastellen
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// Rückgabewert: Zahl
  
function inputNumber (ef, d, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(decimalSeparator,".");                     // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls möglich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu groß, korrigieren
  ef.value = ToString(n,d,true);                           // Eingabe verwenden (eventuell korrigiert)
  return n;                                                // Rückgabewert
  }
  
// Hilfsroutine: Zahl der Nachkommastellen (Brechungsindex)
// nr ... Nummer in Auswahlliste

function numberDigits (nr) {
  if (nr == 0) return 0;                                   // Vakuum (n = 1)
  if (nr == 1) return 4;                                   // Luft (n == 1,0003)
  return 2;
  }
   
// Gesamte Eingabe:
// Seiteneffekt n1, n2, eps1 

function input () {
  n1 = inputNumber(ip1,numberDigits(nr1),1,5);             // 1. Brechungsindex aus Eingabefeld übernehmen
  n2 = inputNumber(ip2,numberDigits(nr2),1,5);             // 2. Brechungsindex aus Eingabefeld übernehmen
  eps1 = DEG*inputNumber(ip3,1,0,90);                      // Einfallswinkel (Bogenmaß) aus Eingabefeld übernehmen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  var s = text07[nr1][1];                                  // Zeichenkette für 1. Brechungsindex aus der Liste
  if (nr1 == nMedia-1) s = String(n1);                     // Falls kein definiertes Medium, bisheriger Brechungsindex
  ip1.value = s.replace(".",decimalSeparator);             // Eingabefeld für 1. Brechungsindex aktualisieren
  s = text07[nr2][1];                                      // Zeichenkette für 2. Brechungsindex aus der Liste
  if (nr2 == nMedia-1) s = String(n2);                     // Falls kein definiertes Medium, bisheriger Brechungsindex
  ip2.value = s.replace(".",decimalSeparator);             // Eingabefeld für 2. Brechungsindex aktualisieren
  ip3.value = ToString(eps1/DEG,1,true);                   // Eingabefeld für Einfallswinkel aktualisieren
  }

// Aktualisierung der Ausgabefelder:

function updateOutput () {
  lb1.innerHTML = ToString(eps1/DEG,1,true);               // Ausgabefeld für Reflexionswinkel aktualisieren
  if (refr) lb2.innerHTML = ToString(eps2/DEG,1,true);     // Falls sinnvoll, Ausgabefeld für Brechungswinkel aktualisieren
  else lb2.innerHTML = "&#8211&#8211;";                    // Sonst Ausgabefeld entwerten
  lb3.innerHTML = (n1>n2 ? ToString(epsTR/DEG,1,true) : ""); // Ausgabefeld für Grenzwinkel aktualisieren
  lb3a.innerHTML = (n1>n2 ? text06[0] : "");               // Erklärung zum Ausgabefeld, erste Zeile
  lb3b.innerHTML = (n1>n2 ? text06[1] : "");               // Erklärung zum Ausgabefeld, zweite Zeile
  lb3c.innerHTML = (n1>n2 ? degree : "");                  // Einheit für Ausgabefeld
  }
  
// Reaktion: Rechnung, Ausgabe, neu zeichnen

function reaction () {
  calculation();                                           // Berechnungen durchführen
  updateOutput();                                          // Ausgabefelder aktualisieren
  paint();                                                 // Neu zeichnen
  }
  
// Brechungswinkel berechnen:
// eps ... Einfallswinkel (Bogenmaß, 0 bis pi/2) 
// Bei Totalreflexion Rückgabewert undefined
  
function angleRefraction (eps) {
  var sin = n1*Math.sin(eps)/n2;                           // Sinus des Brechungswinkels
  if (sin > 1 || sin < -1) return undefined;               // Falls Totalreflexion, Rückgabewert undefined
  return Math.asin(sin);                                   // Sonst Brechungswinkel (Bogenmaß) als Rückgabewert
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie der Dicke 1:
// (x1,y1) ... Anfangspunkt
// (x2,y2) ... Endpunkt
// c ......... Farbe (optional)
// w ......... Liniendicke (optional)

function line (x1, y1, x2, y2, c, w) {
  ctx.beginPath();                                         // Neuer Pfad
  if (c) ctx.strokeStyle = c;                              // Linienfarbe, falls angegeben
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Gestrichelte Linie zeichnen:
// u1, v1 ... Anfangspunkt
// u2, v2 ... Endpunkt

function dashedLine (u1, v1, u2, v2) {
  var du = u2-u1, dv = v2-v1;                    // Koordinatendifferenzen
  var l = Math.sqrt(du*du+dv*dv);                // Länge
  var n = Math.floor((l-4)/6);                   // Zahl der Lücken
  var p = (l/2+2-3*n)/l;                         // Parameter am Ende der ersten Linie
  newPath();                                     // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(u1,v1);                             // Zum Anfangspunkt
  ctx.lineTo(u1+p*du,v1+p*dv);                   // Weiter zum Ende der ersten Linie
  while (p < 1) {                                // Solange Endpunkt noch nicht erreicht ...
    p += 2/l; if (p >= 1) break;                 // Parameter für Ende der nächsten Lücke
    ctx.moveTo(u1+p*du,v1+p*dv);                 // Zum Anfangspunkt der nächsten Linie
    p += 4/l; if (p > 1) p = 1;                  // Parameter für Ende der Linie
    ctx.lineTo(u1+p*du,v1+p*dv);                 // Linie hinzufügen
    }
  ctx.stroke();                                  // Linien zeichnen
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
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  ctx.stroke();                                            // Rand zeichnen
  }
    
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // Länge
  if (length == 0) return;                                 // Abbruch, falls Länge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // Länge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt für Pfeilspitze         
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
  ctx.beginPath();                                         // Neuer Pfad für Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// x, y ... Scheitel
// r ...... Radius
// a0 ..... Startwinkel (Bogenmaß)
// a ...... Winkelbetrag (Bogenmaß)
// c ...... Füllfarbe 

function angle (x, y, r, a0, a, c) {
  newPath();                                               // Neuer Pfad
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,PI2-a0,PI2-a0-a,true);                     // Kreisbogen
  ctx.closePath();                                         // Zurück zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausfüllen, Rand zeichnen
  }
  
// Text ausrichten (Zeichensatz FONT):
// s ....... Zeichenkette
// t ....... Typ (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  ctx.font = FONT;                                         // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksbündig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsbündig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Diagramm (Abhängigkeit des Brechungswinkels vom Einfallswinkel):
// (x,y) ... Ursprung (Pixel)
  	
function diagram (x, y) {
  var pix = 2;                                             // Umrechnungsfaktor (Pixel pro Grad)
  ctx.strokeStyle = "#000000";                             // Farbe schwarz
  arrow(x,y,x+205,y);                                      // Waagrechte Achse
  for (var w=10; w<=90; w+=10) {                           // Für alle Vielfachen von 10° ...
  	var xx = x+pix*w;                                      // x-Koordinate berechnen (Pixel)
  	line(xx,y-3,xx,y+3);                                   // Tick zeichnen
  	alignText(""+w+degreeUnicode,1,xx+3,y+15);             // Tick beschriften (Einfallswinkel in °)
  	}
  ctx.fillText(symbolAngle1,x+200,y+13);                   // Beschriftung der Achse
  arrow(x,y,x,y-205);                                      // Senkrechte Achse
  for (w=10; w<=90; w+=10) {                               // Für alle Vielfachen von 10° ...
  	var yy = y-pix*w;                                      // y-Koordinate berechnen (Pixel)
  	line(x-3,yy,x+3,yy);                                   // Tick zeichnen
  	alignText(""+w+degreeUnicode,2,x-3,yy+5);              // Tick beschriften (Brechungswinkel in °)
  	}
  alignText(symbolAngle2,2,x-4,y-195);                     // Beschriftung der Achse
  newPath();                                               // Neuer Grafikpfad
  ctx.moveTo(x,y);                                         // Anfangspunkt der Kurve (Ursprung)
  xx = x;                                                  // x-Koordinate übernehmen
  var pix2 = DEG/pix;                                      // Umrechnungsfaktor (Radiant pro Pixel)
  while (xx < x+90*pix) {                                  // Solange im gezeichneten Bereich ...
    xx++;                                                  // x-Koordinate erhöhen
    var e1 = (xx-x)*pix2;                                  // Zugehörigen Einfallswinkel berechnen (Bogenmaß)
    var e2 = angleRefraction(e1);                          // Zugehörigen Brechungswinkel berechnen (Bogenmaß)
    if (e2 == undefined) {                                 // Falls Totalreflexion ...
      ctx.lineTo(xx,y-180);                                // ... Teilstrecke nach oben fortsetzen ...
      break;                                               // ... und abbrechen
      }
    else ctx.lineTo(xx,y-e2*2/DEG);                        // Andernfalls Teilstrecke zum Pfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  if (!refr) return;                                       // Falls Totalreflexion, abbrechen
  var x0 = x+eps1*2/DEG, y0 = y-eps2*2/DEG;                // Koordinaten für Markierung (Pixel)
  dashedLine(x0,y,x0,y0);                                  // Senkrechte Hilfslinie
  dashedLine(x,y0,x0,y0);                                  // Waagrechte Hilfslinie
  circle(x0,y0,2.5,colorRefraction);                       // Markierung für aktuelle Werte
  }
  	  
// Lichtstrahl:
// w ... Winkel gegenüber Richtung nach oben (Bogenmaß)
// Wichtig: Der Lichtstrahl muss durch Clipping abgeschnitten werden.
  	
function ray (w) {
  ctx.strokeStyle = colorRay;                              // Farbe für Lichtstrahlen
  line(mx,my,mx-r*Math.sin(w),my-r*Math.cos(w));           // Lichtstrahl zeichnen
  }
  
// Brechungs-Experiment:
// (x,y) ... Übergangspunkt (Pixel)

function experiment (x, y) {  
  mx = x; my = y;                                          // Übergangspunkt (Pixel)
  var a = 120;                                             // Halbe Seitenlänge (Pixel)
  ctx.save();                                              // Grafikkontext speichern (für Aufhebung des Clippings)
  ctx.moveTo(mx-a-1,my+a+1);                               // Linke untere Ecke des Clipping-Bereichs
  ctx.lineTo(mx+a+1,my+a+1);                               // Weiter nach rechts
  ctx.lineTo(mx+a+1,my-a-1);                               // Weiter nach oben
  ctx.lineTo(mx-a-1,my-a-1);                               // Weiter nach links
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.clip();                                              // Clipping für Lichtstrahlen
  ctx.fillStyle = (n1<n2 ? colorMedium1 : colorMedium2);   // Farbe für obere Hälfte
  ctx.fillRect(mx-a,my-a,2*a,a);                           // Obere Hälfte ausfüllen
  ctx.fillStyle = (n2<n1 ? colorMedium1 : colorMedium2);   // Farbe für untere Hälfte 
  ctx.fillRect(mx-a,my,2*a,a);                             // Untere Hälfte ausfüllen
  line(mx,my-a,mx,my+a);                                   // Einfallslot
  line(mx-a,my,mx+a,my);                                   // Trennfläche der beiden Medien
  ctx.strokeRect(mx-a,my-a,2*a,2*a);                       // Rahmen für Experiment
  angle(mx,my,20,90*DEG,eps1,colorIncidence);              // Einfallswinkel
  ray(eps1);                                               // Einfallender Lichtstrahl
  if (n1 != n2) {                                          // Falls Brechungsindizes verschieden ...                                
    angle(mx,my,20,90*DEG-eps1,eps1,colorReflection);      // ... Reflexionswinkel
    ray(-eps1);                                            // ... Reflektierter Lichtstrahl
    }
  if (refr) {                                              // Falls Brechung ...                         
    angle(mx,my,20,270*DEG,eps2,colorRefraction);          // ... Brechungswinkel
    ray(Math.PI+eps2);                                     // ... Gebrochener Lichtstrahl
    } 
  ctx.restore();                                           // Clipping rückgängig machen
  }
  
// Grafikausgabe:
// Seiteneffekt
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  ctx.font = FONT;                                         // Zeichensatz
  diagram(320,280);                                        // Diagramm zeichnen
  experiment(140,height/2);                                // Brechungsexperiment zeichnen
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillText(text07[nr1][0],30,my-100);                  // Bezeichnung des 1. Mediums
  ctx.fillText(text07[nr2][0],30,my+110);                  // Bezeichnung des 2. Mediums 
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


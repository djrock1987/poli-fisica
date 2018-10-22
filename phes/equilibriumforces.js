// Gleichgewicht dreier Kr�fte
// Java-Applet (11.03.2000) umgewandelt
// 23.10.2014 - 08.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel equilibriumforces_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorLeft = "#ff0000";                                 // Farbe f�r Kraftpfeil links
var colorLeftAngle = "#ffc0c0";                            // Farbe f�r Winkel links
var colorRight = "#0000ff";                                // Farbe f�r Kraftpfeil rechts
var colorRightAngle = "#00ffff";                           // Farbe f�r Winkel rechts
var colorCenter = "#ff00ff";                               // Farbe f�r Kraftpfeil unten
var color0 = "#ffc800";                                    // Farbe f�r Unterlage
var color1 = "#00ffff";                                    // Farbe f�r Stativstangen
var colorPulley = "#808080";                               // Farbe f�r Rollen

// Konstanten:

var PI2 = 2*Math.PI;                                       // Abk�rzung f�r 2 pi
var DEG = Math.PI/180;                                     // 1 Grad (Bogenma�)
var H1 = 20;                                               // H�he der Unterlage (Pixel)
var H2 = 5;                                                // H�he eines Stativfu�es (Pixel)
var R1 = 13, R2 = 15;                                      // Rollenradius innen/au�en (Pixel)
var L1 = 320, L3 = 150;                                    // Fadenl�nge links/rechts bzw. unten (Pixel)
var H3 = 6;                                                // Abstand der Massenst�cke (Pixel)
var PIX = 16;                                              // Umrechnungsfaktor (Pixel pro N)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ip1, ip2, ip3;                                         // Eingabefelder
var cb;                                                    // Optionsfeld
var op1, op2;                                              // Ausgabefelder
var alpha, beta;                                           // Winkel gegen�ber der Senkrechten (Bogenma�)
var x0, y0;                                                // Angriffspunkt der Kr�fte (Pixel)
var xL, yL;                                                // Rollenmittelpunkte links (Pixel)
var xR, yR;                                                // Rollenmittelpunkte rechts (Pixel)
var xxL, yyL, xxR, yyR;                                    // Bisherige Rollenmittelpunkte (bei �nderungen)
var xBL, yBL, xBR, yBR;                                    // Ber�hrpunkte links/rechts
var f1, f2, f3;                                            // Kraftbetr�ge (N) 
var ff1, ff2, ff3;                                         // Bisherige Kraftbetr�ge (bei �nderungen) 
var h1, h2;                                                // Senkrechte Fadenabschnitte links/rechts (Pixel)
var index;                                                 // Index der Rolle bzw. des Stativs (0 bis 4)

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
  getElement("forces",text01);                             // Erkl�render Text (Kr�fte)
  getElement("ip1a",text02);                               // Erkl�render Text (Kraft links) 
  ip1 = getElement("ip1b");                                // Auswahlfeld (Kraft links)
  getElement("ip1c",newton);                               // Einheit (Kraft links)
  getElement("ip2a",text03);                               // Erkl�render Text (Kraft rechts)
  ip2 = getElement("ip2b");                                // Auswahlfeld (Kraft rechts)
  getElement("ip2c",newton);                               // Einheit (Kraft rechts)
  getElement("ip3a",text04);                               // Erkl�render Text (Kraft unten)
  ip3 = getElement("ip3b");                                // Auswahlfeld (Kraft unten)
  getElement("ip3c",newton);                               // Einheit (Kraft unten)
  cb = getElement("cbPg");                                 // Optionsfeld (Kr�fteparallelogramm)
  cb.checked = true;                                       // Optionsfeld mit H�kchen
  getElement("lbPg",text05);                               // Erkl�render Text (Kr�fteparallelogramm)
  getElement("angles",text06);                             // Erkl�render Text (Winkel)
  getElement("op1a",text07);                               // Erkl�render Text (Winkel links)
  op1 = getElement("op1b");                                // Ausgabefeld (Winkel links)
  getElement("op2a",text08);                               // Erkl�render Text (Winkel rechts)
  op2 = getElement("op2b");                                // Ausgabefeld (Winkel rechts)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  
  xL = 120; yL = 80;                                       // Anfangsposition der linken Rolle
  xR = height-120; yR = 110;                               // Anfangsposition der rechten Rolle
  f1 = 5; f2 = 3; f3 = 6;                                  // Anfangswerte f�r Kraftbetr�ge (N)
  index = 0;                                               // Keine Rolle und kein Stativ ausgew�hlt
  updateInput();                                           // Auswahlfelder aktualisieren
  reaction();                                              // Berechnungen, Ausgabe
  paint();                                                 // Neu zeichnen
  ip1.onchange = reactionChoice1;                          // Reaktion auf Auswahlfeld (Kraft links)
  ip2.onchange = reactionChoice2;                          // Reaktion auf Auswahlfeld (Kraft rechts)
  ip3.onchange = reactionChoice3;                          // Reaktion auf Auswahlfeld (Kraft unten)
  cb.onclick = reactionCheckBox;                           // Reaktion auf Anklicken des Optionsfeldes
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }

// Reaktion auf Dr�cken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Ber�hrung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (index != 0) e.preventDefault();                      // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {   
  index = 0;                                               // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Ber�hrung:
  
function reactionTouchEnd (e) { 
  index = 0;                                               // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (index == 0) return;                                  // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (index == 0) return;                                  // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// x, y ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt index

function reactionDown (x, y) {
  index = 0;                                               // Keine Rolle und kein Stativ ausgew�hlt
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  x -= re.left; y -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)  
  var dx = Math.abs(x-xL), dy = Math.abs(y-yL);            // Koordinatendifferenzen (linke Seite, Pixel) 
  if (dx*dx+dy*dy < 400) {index = 1; return;}              // Entscheidung f�r linke Rolle
  if (dx < 5 && y > 20) {index = 3; return;}               // Entscheidung f�r linke Stativstange
  dx = Math.abs(x-xR); dy = Math.abs(y-yR);                // Koordinatendifferenzen (rechte Seite, Pixel)                 
  if (dx*dx+dy*dy < 400) {index = 2; return;}              // Entscheidung f�r rechte Rolle
  if (dx < 5 && y > 20) {index = 4; return;}               // Entscheidung f�r rechte Stativstange
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// x, y ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt xL, yL, xR, yR, alpha, beta, xBL, yBL, xBR, yBR, x0, y0, h1, h2

function reactionMove (x, y) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  x -= re.left; y -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  if (x < 20 || x > width-20 || y < 20 || y > height-20)   // Falls Position zu nahe am Rand ...
    return;                                                // ... Bewegung ignorieren
  var xxL = xL, yyL = yL, xxR = xR, yyR = yR;              // Positionen der Rollen speichern
  if (index == 0) return;                                  // Falls Zugmodus nicht aktiviert, abbrechen
  else if (index == 1) {xL = x; yL = y;}                   // Position der linken Rolle anpassen
  else if (index == 2) {xR = x; yR = y;}                   // Position der rechten Rolle anpassen
  else if (index == 3) xL = x;                             // Position der linken Stativstange anpassen
  else if (index == 4) xR = x;                             // Position der rechten Stativstange anpassen
  var err = calculation();                                 // Berechnungen durchf�hren
  if (err) {                                               // Falls Fehler aufgetreten ... 
    xL = xxL; yL = yyL; xR = xxR; yR = yyR;                // ... Fr�here Positionen wiederherstellen
    calculation();                                         // ... Berechnungen wiederholen
    }
  paint();                                                 // Neu zeichnen
  }
  
// Ende der Reaktion auf ein Auswahlfeld:
// Seiteneffekt x0, y0, alpha, beta, xL, yL, xR, xBL, yBL, xBR, yBR, h1, h2
  
function reactionEnd () {
  if (f1 == ff1 && f2 == ff2 && f3 == ff3) return;         // Falls keine �nderung, abbrechen
  newPositions();                                          // Neue Positionen berechnen
  var err = calculation();                                 // Berechnungen, Flag f�r Fehler
  if (err) {restoreValues(); calculation();}               // Falls Fehler, fr�here Werte wiederherstellen
  op1.innerHTML = ToString(alpha/DEG,0,true)+" "+degree;   // Winkel links ausgeben (Gradma�)
  op2.innerHTML = ToString(beta/DEG,0,true)+" "+degree;    // Winkel rechts ausgeben (Gradma�)
  updateInput();                                           // Alle Auswahlfelder anpassen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Auswahlfeld (Kraft links):
// Seiteneffekt ff1, ff2, ff3, xxL, yyL, xxR, yyR, f1, x0, y0, alpha, beta, xL, yL, xR, xBL, yBL, xBR, yBR, h1, h2 
  
function reactionChoice1 () {
  saveValues();                                            // Bisherige Werte sichern
  f1 = Number(ip1.value);                                  // Neuer Kraftbetrag links
  reactionEnd();                                           // Hilfsroutine aufrufen
  }
  
// Reaktion auf Auswahlfeld (Kraft rechts):
// Seiteneffekt ff1, ff2, ff3, xxL, yyL, xxR, yyR, f2, x0, y0, alpha, beta, xL, yL, xR, xBL, yBL, xBR, yBR, h1, h2 
  
function reactionChoice2 () {
  saveValues();                                            // Bisherige Werte sichern
  f2 = Number(ip2.value);                                  // Neuer Kraftbetrag rechts
  reactionEnd();                                           // Hilfsroutine aufrufen
  }
  
// Reaktion auf Auswahlfeld (Kraft unten):
// Seiteneffekt ff1, ff2, ff3, xxL, yyL, xxR, yyR, f3, x0, y0, alpha, beta, xL, yL, xR, xBL, yBL, xBR, yBR, h1, h2 
  
function reactionChoice3 () {
  saveValues();                                            // Bisherige Werte sichern
  f3 = Number(ip3.value);                                  // Neuer Kraftbetrag unten
  reactionEnd();                                           // Hilfsroutine aufrufen
  }
    
// Reaktion auf Anklicken des Optionsfeldes (Kr�fteparallelogramm):
  
function reactionCheckBox () {
  paint();                                                 // Neu zeichnen
  }
   
//-------------------------------------------------------------------------------------------------

// Auswahlfeld vorbereiten:
// ch ....... Auswahlfeld
// f ........ Kraftbetrag (N)
// f1, f2 ... Kraftbetr�ge in den beiden anderen Auswahlfeldern

function prepareSelect (ch, f, f1, f2) {
  ch.length = 0;                                           // Vorhandene Eintr�ge l�schen
  var min = minForce(f1,f2), max = maxForce(f1,f2);        // Minimale und maximale Kraft (N)
  for (var i=min; i<=max; i++) {                           // F�r alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = String(i);                                    // Text des Elements (Kraftbetrag) 
    ch.add(o);                                             // Element hinzuf�gen
    }
  ch.selectedIndex = f-min;                                // Aktuelles Element
  }

// Berechnungen:
// R�ckgabewert Fehler
// Seiteneffekt alpha, beta, xBL, yBL, xBR, yBR, x0, y0, h1, h2

function calculation () {
  alpha = Math.acos((f1*f1+f3*f3-f2*f2)/(2*f1*f3));        // Winkel links (Bogenma�)
  beta = Math.acos((f2*f2+f3*f3-f1*f1)/(2*f2*f3));         // Winkel rechts (Bogenma�)
  xBL = xL+R1*Math.cos(alpha);                             // x-Koordinate des linken Ber�hrpunkts 
  yBL = yL-R1*Math.sin(alpha);                             // y-Koordinate des linken Ber�hrpunkts
  xBR = xR-R1*Math.cos(beta);                              // x-Koordinate des rechten Ber�hrpunkts
  yBR = yR-R1*Math.sin(beta);                              // y-Koordinate des rechten Ber�hrpunkts
  // Die neue Position des gemeinsamen Angriffspunktes wird mithilfe eines Systems von zwei linearen Gleichungen
  // mit zwei Unbekannten berechnet (Schnittpunkt zweier Geraden).
  var a11 = Math.sin(alpha), a12 = Math.sin(beta);         // Koeffizienten f�r Gleichungssystem
  var a21 = Math.cos(alpha), a22 = -Math.cos(beta);        // Koeffizienten f�r Gleichungssystem
  var b1 = xBR-xBL, b2 = yBR-yBL;                          // Inhomogener Teil des Gleichungssystems
  var det = a11*a22-a12*a21;                               // Determinante
  var lambda = (b1*a22-a12*b2)/det;                        // Parameter in Geradengleichung 
  x0 = xBL+lambda*a11;                                     // x-Koordinate des neuen Angriffspunktes
  y0 = yBL+lambda*a21;                                     // y-Koordinate des neuen Angriffspunktes
  var dx = xBL-x0, dy = yBL-y0;                            // Verbindungsvektor f�r Fadenabschnitt halblinks
  h1 = L1-Math.sqrt(dx*dx+dy*dy)-R1*(alpha+Math.PI/2);     // Senkrechter Fadenabschnitt links (Pixel)
  dx = xBR-x0; dy = yBR-y0;                                // Verbindungsvektor f�r Fadenabschnitt halbrechts
  h2 = L1-Math.sqrt(dx*dx+dy*dy)-R1*(beta+Math.PI/2);      // Senkrechter Fadenabschnitt rechts (Pixel)
  if (x0 <= xBL+R2*Math.sin(alpha)) return true;           // Fehler: Angriffspunkt zu nahe an der linken Rolle
  if (x0 >= xBR-R2*Math.sin(beta)) return true;            // Fehler: Angriffspunkt zu nahe an der rechten Rolle
  if (h1 < f1*H3+20) return true;                          // Fehler: Gewichte links zu hoch
  if (h2 < f2*H3+20) return true;                          // Fehler: Gewichte rechts zu hoch
  if (h1 >= height-H1-H2-yL) return true;                  // Fehler: Gewichte links zu tief
  if (h2 >= height-H1-H2-yR) return true;                  // Fehler: Gewichte rechts zu tief
  if (L3 >= height-H1-y0) return true;                     // Fehler: Gewichte in der Mitte zu tief
  return false;                                            // Kein Fehler
  }
  
// Hilfsroutine:
// (x,y) ... Bisheriger Angriffspunkt
// s ....... Vorzeichen (-1 f�r links, +1 f�r rechts)
// w ....... Winkelbetrag (Bogenma�)
// R�ckgabewert: Objekt mit den Koordinaten von Ber�hrpunkt und Rollenmittelpunkt
// Seiteneffekt h1, h2

function newPos (x, y, s, w) {
  var sin = Math.sin(w), cos = Math.cos(w);                // Trigonometrische Werte
  var res = {};                                            // Neues Objekt (zun�chst leer)
  h1 = h2 = 100;                                           // Fadenabschnitte
  res.xB = x+s*h1*sin; res.yB = y-h1*cos;                  // Ber�hrpunkt
  res.xR = res.xB+R2*cos; res.yR = res.yB+R2*sin;          // Mittelpunkt der Rolle
  return res;                                              // R�ckgabewert
  }
    
  // Neue Positionen f�r Stativstangen und Rollen:
  // Seiteneffekt x0, y0, alpha, beta, xL, yL, xR, xBL, yBL, xBR, yBR
  
function newPositions () {
  var x0Neu = x0, y0Neu = y0;                              // Neuer Angriffspunkt der Kr�fte
  alpha = Math.acos((f1*f1+f3*f3-f2*f2)/(2*f1*f3));        // Winkel links
  var left = newPos(x0Neu,y0Neu,-1,alpha);                 // Neue Positionen links
  beta = Math.acos((f2*f2+f3*f3-f1*f1)/(2*f2*f3));         // Winkel rechts
  var right = newPos(x0Neu,y0Neu,1,beta);                  // Neue Positionen rechts    
  var dx = (height-left.xR-right.xR)/2;                    // N�tige Verschiebung nach rechts
  var dy = 0;                                              // N�tige Verschiebung nach oben
  if (left.yR > height-H3*f1-H1)                           // Falls links zu tief ...
    dy = left.yR-height+H3*f1+H1;                          // ... Verschiebungsbetrag berechnen
  if (right.yR > height-H3*f2-H1)                          // Falls rechts zu tief ...
    dy = Math.max(dy,right.yR-height+H3*f2+H1);            // ... Verschiebungsbetrag berechnen      
  if (y0Neu+L3+H3*f3+H1 > height)                          // Falls in der Mitte zu tief ...
    dy = Math.max(dy,y0Neu+L3+H3*f3+H1-height);            // ... Verschiebungsbetrag berechnen
  if (y0Neu-PIX*f3 < 10)                                   // Falls zu hoch ...
    dy = y0Neu-PIX*f3-10;                                  // ... Verschiebungsbetrag berechnen
  x0 = x0Neu+dx; y0 = y0Neu-dy;                            // Neue Position f�r Angriffspunkt
  xL = left.xR+dx; yL = left.yR-dy;                        // Neue Position f�r linke Rolle
  xBL = left.xB+dx; yBL = left.yB-dy;                      // Neue Position f�r Ber�hrpunkt links
  xR = right.xR+dx; yR = right.yR-dy;                      // Neue Position f�r rechte Rolle
  xBR = right.xB+dx; yBR = right.yB-dy;                    // Neue Position f�r Ber�hrpunkt rechts
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
   
// Hilfsroutine: Minimale erlaubte Kraft
// f1, f2 ... Betr�ge der beiden anderen Kr�fte (ganzzahlig)
  
function minForce (f1, f2) {
  return Math.abs(f1-f2)+1;                                // Kraft gr��er als Differenz der beiden anderen Kr�fte
  }
    
// Hilfsroutine: Maximale erlaubte Kraft
// f1, f2 ... Betr�ge der beiden anderen Kr�fte (ganzzahlig)
    
function maxForce (f1, f2) {
  return Math.min(f1+f2-1,10);                             // Kraft kleiner als Summe der beiden anderen Kr�fte
  }
  
// Speicherung der bisherigen Daten:
// Seiteneffekt ff1, ff2, ff3, xxL, yyL, xxR, yyR

function saveValues () {
  ff1 = f1; ff2 = f2; ff3 = f3;                            // Kraftbetr�ge
  xxL = xL; yyL = yL; xxR = xR; yyR = yR;                  // Positionen der Rollen
  }
  
// Wiederherstellung der fr�heren Daten:
// Seiteneffekt f1, f2, f3, xL, yL, xR, yR

function restoreValues () {
  f1 = ff1; f2 = ff2; f3 = ff3;                            // Kraftbetr�ge
  xL = xxL; yL = yyL; xR = xxR; yR = yyR;                  // Positionen der Rollen
  }
     
// Aktualisierung der Auswahlfelder:

function updateInput () {
  prepareSelect(ip1,f1,f2,f3);                             // Auswahlfeld f�r Kraft links
  prepareSelect(ip2,f2,f3,f1);                             // Auswahlfeld f�r Kraft rechts
  prepareSelect(ip3,f3,f1,f2);                             // Auswahlfeld f�r Kraft unten
  }
  
// Berechnungen, Ausgabe
// Seiteneffekt alpha, beta, xBL, yBL, xBR, yBR, x0, y0, h1, h2, Wirkung auf Ausgabefelder 

function reaction () {
  calculation();                                           // Berechnungen
  op1.innerHTML = ToString(alpha/DEG,0,true)+" "+degree;   // Winkel links ausgeben (Gradma�)
  op2.innerHTML = ToString(beta/DEG,0,true)+" "+degree;    // Winkel rechts ausgeben (Gradma�)
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
  
// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... H�he (Pixel)
// c ....... F�llfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }
  
// Kreisscheibe mit schwarzem Rand zeichnen:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
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
    
// Unterlage und Stativstangen mit Umlenkrollen zeichnen:

function pulleys () {
  var yMin = 20;                                           // y-Koordinate des oberen Endes (Pixel)
  var w1 = 20;                                             // Halbe Breite eines Stativfu�es (Pixel)
  var w2 = 2;                                              // Halbe Breite einer Stativstange (Pixel)
  rectangle(xL-w2,yMin,2*w2,height-H1-yMin,color1);        // Stange links
  rectangle(xL-w1,height-H1-H2,2*w1,H2,color1);            // Stativfu� links
  rectangle(xR-w2,yMin,2*w2,height-H1-yMin,color1);        // Stange rechts
  rectangle(xR-w1,height-H1-H2,2*w1,H2,color1);            // Stativfu� rechts
  rectangle(0,height-H1,width-1,H1,color0);                // Unterlage
  circle(xL,yL,R2,colorPulley);                            // Rolle links
  circle(xR,yR,R2,colorPulley);                            // Rolle rechts
  circle(xL,yL,1,"#000000");                               // Drehachse links
  circle(xR,yR,1,"#000000");                               // Drehachse rechts
  }
  
// Massenst�cke zeichnen:
// (x,y) ... Position (oberes Fadenende)
// h ....... Fadenabschnitt (Pixel)
// f ....... Gewicht (N, ganzzahlig)

function weight (x, y, h, f) {
  line(x,y,x,y+h);                                         // Fadenabschnitt (senkrecht)
  for (var i=0; i<f; i++)                                  // F�r alle Massenst�cke ...
    rectangle(x-8,y+h+2-(i+1)*H3,16,3.5,"#000000");        // Rechteck zeichnen
  }
  
// Kraftpfeile  und Winkelmarkierungen zeichnen:

function arrows () {
  var pg = cb.checked;                                     // Flag f�r Kr�fteparallelogramm
  var yy = y0-PIX*f3;                                      // y-Koordinate der oberen Parallelogrammecke
  if (pg) {                                                // Falls Kr�fteparallelogramm gew�nscht ...
    angle(x0,y0,20,90*DEG,alpha,colorLeftAngle);           // ... Winkelmarkierung links
    angle(x0,y0,20,90*DEG-beta,beta,colorRightAngle);      // ... Winkelmarkierung rechts
    }
  ctx.strokeStyle = colorLeft;                             // Farbe f�r Kraftpfeil links
  var x1 = x0-PIX*f1*Math.sin(alpha);                      // x-Koordinate der Pfeilspitze links oben
  var y1 = y0-PIX*f1*Math.cos(alpha);                      // y-Koordinate der Pfeilspitze links oben
  arrow(x0,y0,x1,y1,3);                                    // Kraftpfeil (dick) nach links oben
  ctx.strokeStyle = colorRight;                            // Farbe f�r Kraftpfeil rechts
  if (pg) arrow(x1,y1,x0,yy);                              // Verschobener Kraftpfeil (d�nn) nach rechts oben
  x1 = x0+PIX*f2*Math.sin(beta);                           // x-Koordinate der Pfeilspitze rechts oben
  y1 = y0-PIX*f2*Math.cos(beta);                           // y-Koordinate der Pfeilspitze rechts oben
  arrow(x0,y0,x1,y1,3);                                    // Kraftpfeil (dick) nach rechts oben
  if (pg) {                                                // Falls Kr�fteparallelogramm gew�nscht ...
    ctx.strokeStyle = colorLeft;                           // ... Farbe f�r Kraftpfeil links 
    arrow(x1,y1,x0,yy);                                    // ... Verschobener Kraftpfeil (d�nn) nach links oben
    }
  ctx.strokeStyle = colorCenter;                           // Farbe f�r Kraftpfeil unten
  y1 = y0+PIX*f3;                                          // y-Koordinate der Pfeilspitze unten 
  arrow(x0,y0,x0,y1,3);                                    // Kraftpfeil (dick) nach unten
  if (pg) arrow(x0,y0,x0,yy);                              // Kraftpfeil (d�nn) f�r Gegenkraft nach oben
  }  

// Zeichenfl�che aktualisieren:

function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  weight(xL-R1,yL,h1,f1);                                  // Massenst�cke links
  weight(xR+R1,yR,h2,f2);                                  // Massenst�cke rechts
  weight(x0,y0,L3,f3);                                     // Massenst�cke dazwischen
  line(xBL,yBL,x0,y0);                                     // Schnurabschnitt nach links oben
  line(xBR,yBR,x0,y0);                                     // Schnurabschnitt nach rechts oben
  pulleys();                                               // Unterlage, Stativstangen mit Rollen 
  arrows();                                                // Kraftpfeile und Winkelmarkierungen
  circle(x0,y0,2.5,"#000000");                             // Angriffspunkt der Kr�fte (Knoten)
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


// Photoelektrischer Effekt
// Java-Applet (20.02.2000) umgewandelt
// 20.10.2015 - 14.01.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel photoeffect_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorCs = "#ff4020";                                   // Farbe f�r Caesium
var colorNa = "#208040";                                   // Farbe f�r Natrium 
var colorVoltage = "#0000ff";                              // Farbe f�r Spannung
var colorAmperage = "#ff0000";                             // Farbe f�r Stromst�rke 
var colorFilter = [                                        // Farben der Filter bzw. Spektrallinien
    "#f0f080", "#00ff00", "#ff00ff", "#c000c0", "#800080"];

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Normaler Zeichensatz
var FONT2 = "normal normal bold 16px sans-serif";          // Gr��erer Zeichensatz
var DEG = Math.PI/180;                                     // Winkelgrad
var e = 1.602176565e-19;                                   // Elementarladung (C)
var c = 2.99792458e8;                                      // Lichtgeschwindigkeit (m/s)
var h = 6.62606957e-34;                                    // Plancksches Wirkungsquantum (Js)
var wMat = [2.14, 2.28];                                   // Abl�searbeit (Caesium 1,7 eV bis 2,14 eV, Natrium 2,28 eV)
var lambdaLine = [                                         // Wellenl�ngen der Spektrallinien (m)
  5.78e-7, 5.46e-7, 4.36e-7, 3.65e-7, 2.54e-7];
var tol = 0.005;                                           // Toleranz (eV)
var numberMat = wMat.length;                               // Zahl der Kathodenmaterialien
var numberLines = lambdaLine.length;                       // Zahl der Spektrallinien
var pixX = 120;                                            // Pixel pro 1000 THz (Diagramm)
var pixY = 36;                                             // Pixel pro eV (Diagramm)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ch1, ch2;                                              // Auswahlfelder
var sl1, sl2;                                              // Schieberegler
var opVoltage, opFrequency, opPhotonEnergy,                // Ausgabefelder
  opWorkFunction, opEKin;                                  

var iMat;                                                  // Index Kathodenmaterial (0 oder 1) 
var iLine;                                                 // Index Spektrallinie (0 bis 4)
var iComm;                                                 // Index Kommentar (0 bis 5)

var eKin;                                                  // Maximale kinetische Energie eines Elektrons (eV)
var voltage;                                               // Gegenspannung (V)
var measured;                                              // Zweifach indiziertes Array (Einzelmessung durchgef�hrt)
var seriesEnded;                                           // Array (Messungen zu einem Kathodenmaterial beendet) 
var xM;                                                    // Array f�r x-Koordinaten im Diagramm (Pixel)
var yM;                                                    // Zweifach indiziertes Arrays f�r y-Koordinaten im Diagramm (Pixel)
var end;                                                   // Flag f�r das Ende aller Messungen

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
  getElement("lb1",text01);                                // Erkl�render Text (Kathodenmaterial)
  ch1 = getElement("ch1");                                 // Leeres Auswahlfeld (Kathodenmaterial)
  initSelect1();                                           // Optionen hinzuf�gen
  ch1.disabled = false;                                    // Auswahlfeld aktiviert 
  getElement("lb2",text03);                                // Erkl�render Text (Spektrallinie)
  ch2 = getElement("ch2");                                 // Leeres Auswahlfeld (Spektrallinie)
  initSelect2();                                           // Optionen hinzuf�gen
  ch2.disabled = false;                                    // Auswahlfeld aktiviert
  getElement("lb3",text04);                                // Erkl�render Text (Gegenspannung)
  sl1 = getElement("sl1");                                 // Linker Schieberegler (Grobeinstellung Gegenspannung)
  sl1.value = 0;                                           // Anfangsposition ganz links
  sl2 = getElement("sl2");                                 // Rechter Schieberegler (Feineinstellung Gegenspannung)
  sl2.value = 0;                                           // Anfangsposition ganz links
  voltage = 0;                                             // Anfangswert Gegenspannung
  opVoltage = getElement("ip1");                           // Ausgabefeld (Gegenspannung)
  opVoltage.innerHTML = ToString(voltage,2,true);          // Zahlenwert (Gegenspannung)
  getElement("ip2",volt);                                  // Einheit Gegenspannung (Volt)
  getElement("op1a",text05);                               // Erkl�render Text (Frequenz)
  opFrequency = getElement("op1b");                        // Ausgabefeld (Frequenz)
  getElement("op1c",terahertz);                            // Einheit Frequenz (Terahertz)
  getElement("op2a",text06[0]);                            // Erkl�render Text (Photonenenergie, obere Zeile)
  getElement("op2b",text06[1]);                            // Erkl�render Text (Photonenenergie, untere Zeile)
  opPhotonEnergy = getElement("op2c");                     // Ausgabefeld (Photonenenergie)
  getElement("op2d",electronvolt);                         // Einheit Photonenenergie (Elektronenvolt)
  getElement("op3a",text07);                               // Erkl�render Text (Austrittsarbeit)
  opWorkFunction = getElement("op3b");                     // Ausgabefeld (Austrittsarbeit)
  getElement("op3c",electronvolt);                         // Einheit Austrittsarbeit (Elektronenvolt)
  getElement("op4a",text08[0]);                            // Erkl�render Text (maximale kinetische Energie, obere Zeile)
  getElement("op4b",text08[1]);                            // Erkl�render Text (maximale kinetische Energie, untere Zeile)
  opKineticEnergy = getElement("op4c");                    // Ausgabefeld (maximale kinetische Energie)
  getElement("op4d",electronvolt);                         // Einheit kinetische Energie (ElektronenvoltO
  bu = getElement("bu",text09);                            // Schaltknopf (Messergebnisse l�schen)
  getElement("author",author);                             // Autor (und �bersetzer) 
  
  measured = new Array(numberMat);                         // Neues Array (Einzelmessung durchgef�hrt)
  for (i=0; i<numberMat; i++)                              // F�r alle ersten Indizes ...
    measured[i] = new Array(numberLines);                  // Einfach indiziertes Array  
  seriesEnded = new Array(numberMat);                      // Neues Array (Messreihe beendet)
  deleteMeasurements();                                    // Messergebnisse l�schen
  xM = new Array(numberLines);                             // Neues Array (x-Koordinaten im Diagramm)
  yM = new Array(numberMat);                               // Neues Array y-Koordinaten im Diagramm, zweifach indiziert)
  for (i=0; i<numberMat; i++)                              // F�r alle Kathodenmaterialien ...
    yM[i] = new Array(numberLines);                        // Einfach indiziertes Array f�r y-Koordinaten
  for (j=0; j<numberLines; j++) {                          // F�r alle Spektrallinien ...
    var f = c/lambdaLine[j];                               // Frequenz (Hz)
    xM[j] = 30+f*12/1e14;                                  // x-Koordinate (Pixel)
    for (i=0; i<numberMat; i++) {                          // F�r alle Kathodenmaterialien ...
      var u = h*f/e-wMat[i];                               // Gegenspannung (V)
      yM[i][j] = 280-u*pixY;                               // y-Koordinate (Pixel)
      }
    }
  actionEnd(true);                                         // Spannung gleich 0, Berechnungen, Ausgabe aktualisieren

  ch1.onchange = reactionSelect1;                          // Reaktion auf erstes Auswahlfeld (Kathodenmaterial)  
  ch2.onchange = reactionSelect2;                          // Reaktion auf zweites Auswahlfeld (Spektrallinie)
  sl1.onchange = reactionSlider;                           // Reaktion auf linken Schieberegler (Gegenspannung, Grobeinstellung)
  sl2.onchange = reactionSlider;                           // Reaktion auf rechten Schieberegler (Gegenspannung, Feineinstellung)
  sl1.oninput = reactionSlider;                            // Reaktion auf linken Schieberegler (Gegenspannung, Grobeinstellung)
  sl2.oninput = reactionSlider;                            // Reaktion auf rechten Schieberegler (Gegenspannung, Feineinstellung)
  sl1.onclick = reactionSlider;                            // Reaktion auf linken Schieberegler (Gegenspannung, Grobeinstellung)
  sl2.onclick = reactionSlider;                            // Reaktion auf rechten Schieberegler (Gegenspannung, Feineinstellung)
  bu.onclick = reactionReset;                              // Reaktion auf Resetknopf

      
  } // Ende der Methode start
  
// Initialisierung der ersten Auswahlliste:
  
function initSelect1 () {
  for (var i=0; i<text02.length; i++) {                    // F�r alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = text02[i];                                    // Text des Elements �bernehmen 
    ch1.add(o);                                            // Element zur Liste hinzuf�gen
    }
  }
  
// Initialisierung der zweiten Auswahlliste:

function initSelect2 () {
  for (var i=0; i<text10.length; i++) {                    // F�r alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    var s = text10[i];                                     // Bezeichnung der Farbe
    s += " ("+Math.round(lambdaLine[i]*1e9)+" nm)";        // Angabe der Wellenl�nge
    o.text = s;                                            // Text des Elements festlegen
    ch2.add(o);                                            // Element zur Liste hinzuf�gen
    }
  }
  
// Reaktion auf erstes Auswahlfeld (Kathodenmaterial):
// Seiteneffekt iMat, iLine, voltage, eKin, iComm 
// Wirkung auf untere Auswahlliste (Spektrallinie)

function reactionSelect1 () {
  iMat = ch1.selectedIndex;                                // Index Kathodenmaterial
  ch2.selectedIndex = 0;                                   // Erste Spektrallinie ausw�hlen
  iLine = 0;                                               // Index Spektrallinie
  actionEnd(true);                                         // Spannung gleich 0, Berechnungen, Ausgabe aktualisieren
  }
  
// Reaktion auf zweites Auswahlfeld (Spektrallinie):
// Seiteneffekt iLine, voltage, eKin, iComm

function reactionSelect2 () {
  iLine = ch2.selectedIndex;                               // Index Spektrallinie
  actionEnd(true);                                         // Spannung gleich 0, Berechnungen, Ausgabe aktualisieren
  }
  
// Reaktion auf Schieberegler:
// Seiteneffekt voltage, measured, seriesEnded, end, eKin, iComm
// Wirkung auf Aktivierung/Deaktivierung der oberen Auswahlliste

function reactionSlider () {
  voltage = 0.1*sl1.value+0.01*sl2.value;                  // Gegenspannung (V)  
  if (eKin >= tol && Math.abs(voltage-eKin) <= tol) {      // Falls Gegenspannung richtig ...
    measured[iMat][iLine] = true;                          // Flag f�r durchgef�hrte Einzelmessung
    seriesEnded[iMat] = seriesReady(iMat);                 // Flag f�r beendete Messreihe 
    end = true;                                            // Flag f�r Abschluss aller Messungen
    for (var i=0; i<numberMat; i++)                        // F�r alle Kathodenmaterialien ...
      if (!seriesEnded[i]) end = false;
    }
  ch1.disabled = !seriesEnded[iMat];                       // Auswahlliste Kathodenmaterial aktivieren oder deaktivieren
  actionEnd(false);                                        // Berechnungen, Ausgabe aktualisieren
  }
   
// Reaktion auf Resetknopf (L�schen der Messergebnisse):
// Seiteneffekt seriesEnded, measured, end, iMat, iLine, voltage ...
// Wirkung auf ch1, ch2 und sl ...
   
function reactionReset () {
  deleteMeasurements();                                    // Messergebnisse l�schen
  actionEnd(true);                                         // Spannung gleich 0, Berechnungen, Ausgabe aktualisieren
  ch1.disabled = false;                                    // Auswahlliste Material aktivieren
  }

//-------------------------------------------------------------------------------------------------

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// L�schung der Messergebnisse:
// Seiteneffekt measured, seriesEnde, end, iMat, iLine
// Wirkung auf Auswahlfelder

function deleteMeasurements () {
  for (var i=0; i<numberMat; i++) {                        // F�r alle Kathodenmaterialien ...
    seriesEnded[i] = false;                                // Flag f�r beendete Messreihe
    for (var j=0; j<numberLines; j++)                      // F�r alle Spektrallinien ...
      measured[i][j] = false;                              // Flag f�r durchgef�hrte Einzelmessung
    }
  end = false;                                             // Flag f�r Abschluss aller Messungen
  iMat = 0; ch1.selectedIndex = 0;                         // Erstes Kathodenmaterial
  iLine = 0; ch2.selectedIndex = 0;                        // Erste Spektrallinie
  }
  
// �berpr�fung, ob Messreihe komplett:
// iMat ... Index des Kathodenmaterials

function seriesReady (iMat) {
  var n = 0;                                               // Zahl der durchgef�hrten Messungen
  for (var j=0; j<numberLines; j++) {                      // F�r alle Spektrallinien ...
    var eKin = h*c/lambdaLine[j];                          // Maximale kinetische Energie eines Elektrons (J)
    if (eKin/e < wMat[iMat]) n++;                          // Unm�gliche Messung als durchgef�hrt werten
    if (measured[iMat][j]) n++;                            // Falls Messung durchgef�hrt, Zahl erh�hen
    }
  return (n >= numberLines);                               // R�ckgabewert
  }
  
// Hilfsroutine f�r Aktionen: Berechnungen, Aktualisierung der Ausgabe und des Kommentars
// n ... Flag f�r Nullsetzen der Gegenspannung
// Wirkung auf Schieberegler und Aktivierung/Deaktivierung der Auswahlfelder
// Seiteneffekt voltage, eKin, iComm

function actionEnd (n) {
  if (n == true) {                                         // Falls Flag gesetzt ... 
    voltage = 0;                                           // Gegenspannung gleich 0 setzen    
    sl1.value = 0; sl2.value = 0;                          // Schieberegler zur�cksetzen
    }
  var w = wMat[iMat];                                      // Austrittsarbeit (eV)
  var ny = c/lambdaLine[iLine];                            // Frequenz (Hz)
  var ePhoton = h*ny/e;                                    // Photonenenergie (eV)
  eKin = ePhoton-w;                                        // Maximale kinetische Energie eines Elektrons (eV)
  opVoltage.innerHTML = ToString(voltage,2,true);          // Ausgabe Gegenspannung (V)
  opFrequency.innerHTML = ToString(ny/1e12,0,true);        // Ausgabe Frequenz (Hz)
  opPhotonEnergy.innerHTML = ToString(ePhoton,2,true);     // Ausgabe Photonenenergie (eV)
  opWorkFunction.innerHTML = ToString(w,2,true);           // Ausgabe Austrittsarbeit (eV)
  var s = (eKin >= tol ? ToString(eKin,2,true) : "---");   // Zeichenkette f�r maximale kinetische Energie
  opKineticEnergy.innerHTML = s;                           // Ausgabe maximale kinetische Energie
  if (!measured[iMat][iLine]) {                            // Falls Einzelmessung noch nicht durchgef�hrt ...
    if (eKin < tol) iComm = 0;                             // Kommentar: Photonenenergie zu klein
    else if (voltage < eKin-tol) iComm = 1;                // Kommentar: Gegenspannung zu klein
    else if (voltage > eKin+tol) iComm = 2;                // Kommentar: Gegenspannung zu gro�
    }
  else if (!seriesEnded[iMat]) iComm = 3;                  // Kommentar: Neue Spektrallinie
  else if (!end) iComm = 4;                                // Kommentar: Neues Material
  else iComm = 5;                                          // Kommentar: Messungen abgeschlossen    
  paint();                                                 // Neu zeichnen
  ch2.disabled = seriesEnded[iMat];                        // Auswahlliste Spektrallinie aktivieren oder deaktivieren                         
  }
       
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:
// w ... Liniendicke (optional, Default-Wert 1)

function newPath (w) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke
  }
  
// Ausgef�lltes Rechteck mit schwarzem Rand:
// x ... x-Koordinate links oben (Pixel)
// y ... y-Koordinate links oben (Pixel)
// w ... Breite (Pixel)
// h ... H�he (Pixel)
// c ... F�llfarbe (optional, Defaultwert schwarz)

function rectangle (x, y, w, h, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = (c ? c : "#000000");                     // F�llfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen (schwarz)
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)
// w ........ Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  newPath(w);                                              // Neuer Grafikpfad
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen
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
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// w ....... Liniendicke (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, w, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausf�llen, falls gew�nscht
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Farbiger Kreissektor:
// (x,y) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// a0 ...... Startwinkel (Bogenma�)
// a ....... Mittelpunktswinkel (Bogenma�)

function sector (x, y, r, a0, a) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.moveTo(x,y);                                         // Kreismittelpunkt als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Radius entsprechend Startwinkel vorbereiten
  ctx.arc(x,y,r,2*Math.PI-a0,2*Math.PI-a0-a,true);         // Kreisbogen vorbereiten
  ctx.closePath();                                         // Zur�ck zum Kreismittelpunkt
  ctx.fill();                                              // Ausgef�llten Sektor zeichnen
  }
  
// Ausgabe von Text:
// s ....... Zeichenkette
// (x,y) ... Position (Pixel)
// a ....... Ausrichtung (0 f�r linksb�ndig, 1 f�r zentriert, 2 f�r rechtsb�ndig)
  
function write (s, x, y, a) {
  var al = "left";                                         // Textausrichtung linksb�ndig ...                                            
  if (a == 1) al = "center";                               // ... oder zentiert ...
  if (a == 2) al = "right";                                // ... oder rechtsb�ndig
  ctx.textAlign = al;                                      // Textausrichtung �bernehmen
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Widerstand mit Anschlussdr�hten:
// (x,y) ... Mittelpunkt (Pixel)
// w ....... Breite (Pixel)
// h ....... H�he (Pixel)

function resistor (x, y, w, h) {
  newPath(2.5);                                            // Neuer Grafikpfad
  ctx.strokeRect(x-w/2,y-h/2,w,h);                         // Symbol (Rechteck) 
  if (w > h) {                                             // Falls waagrechte Lage ...
    line(x-w/2-20,y,x-w/2,y);                              // Anschlussdraht links
    line(x+w/2,y,x+w/2+20,y);                              // Anschlussdraht rechts
    }
  else {                                                   // Falls senkrechte Lage ...
    line(x,y-h/2-20,x,y-h/2);                              // Anschlussdraht oben
    line(x,y+h/2,x,y+h/2+20);                              // Anschlussdraht unten
    }  
  }
  
// Quecksilberdampflampe:
// (x,y) ... Mittelpunkt (Pixel)

function hgLamp (x, y) {
  newPath(2);                                              // Neuer Grafikpfad
  ctx.arc(x,y,20,255*DEG,105*DEG,true);                    // Kreisbogen Mitte links
  ctx.lineTo(x-5,y+30);                                    // Rand links unten
  ctx.arc(x,y+30,5,Math.PI,0,true);                        // Unterer Abschluss
  ctx.lineTo(x+5,y+20);                                    // Rand rechts unten
  ctx.arc(x,y,20,75*DEG,285*DEG,true);                     // Kreisbogen Mitte rechts
  ctx.lineTo(x+5,y-30);                                    // Rand rechts oben
  ctx.arc(x,y-30,5,0,Math.PI,true);                        // Oberer Abschluss
  ctx.closePath();                                         // Rand links oben
  ctx.stroke();                                            // Geh�use zeichnen
  ctx.fillRect(x-1.5,y-40,3,36);                           // Obere Elektrode
  ctx.fillRect(x-1.5,y+5,3,36);                            // Untere Elektrode
  }
  
// Stromkreis f�r Quecksilberdampflampe:

function circuitLamp () {       
  circle(50,140,3,2);                                      // Spannungsquelle, linke Buchse 
  circle(70,140,3,2);                                      // Spannungsquelle, rechte Buchse
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(47,140);                                      // Anfangspunkt (linke Buchse)
  ctx.lineTo(30,140);                                      // Weiter nach links
  ctx.lineTo(30,130);                                      // Weiter nach oben (Widerstand)
  ctx.moveTo(30,30);                                       // Neuer Anfangspunkt (oberhalb des Widerstands)
  ctx.lineTo(30,20);                                       // Weiter nach oben
  ctx.lineTo(90,20);                                       // Weiter nach rechts
  ctx.lineTo(90,40);                                       // Weiter nach unten (Hg-Lampe)
  ctx.moveTo(90,120);                                      // Neuer Anfangspunkt (unterhalb der Hg-Lampe)
  ctx.lineTo(90,140);                                      // Weiter nach unten
  ctx.lineTo(73,140);                                      // Weiter nach links (rechte Buchse)
  ctx.stroke();                                            // Dr�hte zeichnen
  resistor(30,80,20,60);                                   // Widerstand
  ctx.font = FONT2;                                        // Gr��ere Schrift
  write("\u007E",60,153,1);                                // Symbol f�r Wechselspannung
  hgLamp(90,80);                                           // Quecksilberdampflampe
  }
  
// Linse:
// (x,y) ... Mittelpunkt (Pixel)
// h ....... Linsenradius (Pixel)
// d ....... halbe Dicke (Pixel)

function lens (x, y, h, d) {
  var r0 = (d*d+h*h)/(2*d);                                // Radius der beiden Kreisb�gen (Pixel)
  var alpha = Math.atan(h/r0);                             // Halber �ffnungswinkel (Bogenma�)
  newPath(1.5);                                            // Neuer Grafikpfad
  ctx.arc(x-d+r0,y,r0,Math.PI+alpha,Math.PI-alpha,true);   // Kreisbogen (linke Grenzfl�che)
  ctx.arc(x+d-r0,y,r0,alpha,-alpha,true);                  // Kreisbogen (rechte Grenzfl�che)
  ctx.closePath();                                         // Grafikpfad schlie�en
  ctx.stroke();                                            // Linse zeichnen
  }

// Optisches System:

function opticalSystem () {
  rectangle(140,30,10,100,colorFilter[iLine]);             // Filter
  rectangle(170,30,5,40);                                  // Blende links oben
  rectangle(170,90,5,40);                                  // Blende links unten
  lens(200,80,30,6);                                       // Linse
  rectangle(225,30,5,40);                                  // Blende rechts oben
  rectangle(225,90,5,40);                                  // Blende rechts unten
  }
   
// Photozelle:
// (x,y) ... Mittelpunkt (Pixel)

function photoCell (x, y) {
  ctx.fillStyle = (iMat==0 ? colorCs : colorNa);           // Farbe je nach Kathodenmaterial
  sector(x,y,30,300*DEG,120*DEG);                          // Kreissektor farbig
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  sector(x,y,20,0,2*Math.PI);                              // Kreis in Hintergrundfarbe
  circle(x,y,30,2);                                        // Glaskugel
  newPath(2);                                              // Neuer Grafikpfad
  ctx.moveTo(x-6,y);                                       // Anfangspunkt f�r Ellipse (Anode)
  ctx.quadraticCurveTo(x-6,y-14,x-10,y-14);                // Ellipsenbogen rechts oben
  ctx.quadraticCurveTo(x-14,y-14,x-14,y);                  // Ellipsenbogen links oben
  ctx.quadraticCurveTo(x-14,y+14,x-10,y+14);               // Ellipsenbogen links unten
  ctx.quadraticCurveTo(x-6,y+14,x-6,y);                    // Ellipsenbogen rechts unten
  ctx.stroke();                                            // Ellipse f�r Anode zeichnen
  ctx.font = FONT;                                         // Normaler Zeichensatz
  write(symbolCathode,x+20,y-35,1);                        // Abk�rzung Kathode
  write(symbolAnode,x-10,y-35,1);                          // Abk�rzung Anode
  }
  
// Batterie:
// (x,y) ... Mittelpunkt (Pixel)

function battery (x, y) {
  rectangle(x-7,y-10,3,20);                                // Minuspol (links)
  rectangle(x+4,y-20,1,40);                                // Pluspol (rechts)
  line(x-20,y-15,x-10,y-15,"#000000",2);                   // Minuszeichen
  line(x+10,y-15,x+20,y-15,"#000000",2);                   // Pluszeichen, waagrechte Linie
  line(x+15,y-20,x+15,y-10,"#000000",2);                   // Pluszeichen, senkrechte Linie
  }
  
// Potentiometerschaltung:
// (x,y) ... Mittelpunkt des Widerstands

function potentiometer (x, y, part) {
  battery(x,y+40);                                         // Batterie
  resistor(x,y,60,20);                                     // Schiebewiderstand
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(x+5,y+40);                                    // Anfangspunkt (Batterie Pluspol, rechts)
  ctx.lineTo(x+50,y+40);                                   // Weiter nach rechts
  ctx.lineTo(x+50,y);                                      // Weiter nach oben (Knoten)
  ctx.moveTo(x-50,y);                                      // Neuer Anfangspunkt (links vom Widerstand)
  ctx.lineTo(x-50,y+40);                                   // Weiter nach unten
  ctx.lineTo(x-5,y+40);                                    // Weiter nach rechts (Batterie Minuspol, links)
  ctx.stroke();                                            // Dr�hte zeichnen
  var xx = x+30-part*60;                                   // Position Schleifkontakt (Pixel)
  line(x-50,y-30,xx,y-30);                                 // Zuleitung f�r Schleifkontakt
  arrow(xx,y-30,xx,y-10);                                  // Pfeil f�r Schleifkontakt
  }
  
// Knoten:
// (x,y) ... Position (Pixel)

function node (x, y) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = "#000000";                               // F�llfarbe schwarz
  ctx.arc(x,y,2.5,0,2*Math.PI,true);                       // Kreis vorbereiten
  ctx.fill();                                              // Ausgef�llten Kreis zeichnen
  }
  
// Verst�rker:
// (x,y) ... Mittelpunkt (Pixel)

function amplifier (x, y) {
  newPath(2);                                              // Neuer Grafikpfad
  ctx.strokeRect(x-30,y-30,60,60);                         // Rechteck f�r Geh�use
  node(x-20,y-20);                                         // Buchse links oben (Eingang) 
  node(x-20,y+20);                                         // Buchse links unten (Eingang)
  node(x+20,y-10);                                         // Buchse rechts oben (Ausgang) 
  node(x+20,y+10);                                         // Buchse rechts unten (Ausgang)
  newPath(2);                                              // Neuer Grafikpfad
  ctx.moveTo(x+10,y);                                      // Anfangspunkt (Spitze des Dreiecks, rechts)
  ctx.lineTo(x-10,y-15);                                   // Weiter nach links oben
  ctx.lineTo(x-10,y+15);                                   // Weiter nach unten
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.stroke();                                            // Dreieck als Verst�rker-Symbol zeichnen
  }
  
// Kondensator mit Anschlussdr�hten:
// (x,y) ... Mittelpunkt (Pixel)

function condensator (x, y) {
  rectangle(x-9,y-20,4,40);                                // Linke Platte
  rectangle(x+5,y-20,4,40);                                // Rechte Platte
  line(x-30,y,x-10,y);                                     // Linker Anschlussdraht 
  line(x+10,y,x+30,y);                                     // Rechter Anschlussdraht
  }
  
// Messger�t:
// (x,y) .... Mitte zwischen den Anschlussbuchsen (Pixel)
// part ..... Bruchteil des Vollauschlags

function meter (c, x, y, part) {
  rectangle(x-30,y-70,60,60,"#ffffff");                    // Hintergrund der Skala
  for (var i=0; i<=3; i++) {                               // F�r alle Markierungen der Skala ...
    var w = -0.36+i*0.24;                                  // Winkel (Bogenma�)
    var cos = Math.cos(w), sin = Math.sin(w);              // Trigonometrische Werte
    var x0 = x+55*sin, y0 = y-55*cos;                      // Anfangspunkt
    var x1 = x+65*sin, y1 = y-65*cos;                      // Endpunkt
    line(x0,y0,x1,y1,"#000000",3);                         // Markierung zeichnen
    }
  w = -0.36+part*0.72;                                     // Winkel f�r Zeiger (Bogenma�)
  cos = Math.cos(w); sin = Math.sin(w);                    // Trigonometrische Werte
  x1 = x+50*sin; y1 = y-50*cos;                            // Endpunkt Zeiger
  line(x,y,x1,y1,"#000000",3);                             // Zeiger zeichnen
  rectangle(x-30,y-10,60,20,c);                            // Unterer Teil
  node(x-10,y); node(x+10,y);                              // Anschlussbuchsen links/rechts
  }
  
// Dr�hte:
    
function wires () {
  node(270,150);                                           // Knoten bei Anode
  node(370,180);                                           // Knoten bei Pluspol 
  node(390,180);                                           // Knoten mit vier Dr�hten
  node(390,80);                                            // Knoten bei Kondensator 
  newPath();                                               // Neuer Grafikpfad     
  // Vom Knoten bei der Anode zum Spannungsmessger�t (linke Buchse):
  ctx.moveTo(270,150);                                     // Anfangspunkt (Knoten bei Anode)
  ctx.lineTo(250,150);                                     // Weiter nach links
  ctx.lineTo(250,330);                                     // Weiter nach unten
  ctx.lineTo(310,330);                                     // Weiter nach rechts (linke Buchse des Spannungsmessger�ts)
  // Vom Viererknoten zum Spannungsmessger�t (rechte Buchse):
  ctx.moveTo(390,180);                                     // Neuer Anfangspunkt (Viererknoten)
  ctx.lineTo(390,330);                                     // Weiter nach unten
  ctx.lineTo(330,330);                                     // Weiter nach links (rechte Buchse des Spannungsmessger�ts)
  // Zur Anode:
  ctx.moveTo(270,150);                                     // Neuer Anfangspunkt (Knoten bei Anode)
  ctx.lineTo(270,95);                                      // Weiter nach oben (Anode, unteres Ende)
  // Von der Photokathode �ber einen Knoten zum Kondensator:
  ctx.moveTo(310,80);                                      // Neuer Anfangspunkt (Kathode rechts)
  ctx.lineTo(410,80);                                      // Weiter nach rechts (Kondensator links)
  // Vom Kondensator zum Verst�rkereingang (obere Buchse):
  ctx.moveTo(460,80);                                      // Neuer Anfangspunkt (Kondensator rechts)
  ctx.lineTo(460,110);                                     // Weiter nach unten
  ctx.lineTo(480,110);                                     // Weiter nach rechts (Verst�rkereingang, obere Buchse)
  // Vom Knoten beim Pluspol �ber den Viererknoten zum Verst�rkereingang (untere Buchse):
  ctx.moveTo(370,180);                                     // Neuer Anfangspunkt (Knoten beim Pluspol)
  ctx.lineTo(460,180);                                     // Weiter nach rechts
  ctx.lineTo(460,150);                                     // Weiter nach oben
  ctx.lineTo(480,150);                                     // Weiter nach rechts (Verst�rkereingang, untere Buchse)
  // Verbindung Verst�rkerausgang - Messger�t:
  ctx.moveTo(520,120);                                     // Neuer Anfangspunkt (Verst�rkerausgang, obere Buchse)
  ctx.lineTo(560,120);                                     // Weiter nach rechts
  ctx.lineTo(560,330);                                     // Weiter nach unten
  ctx.lineTo(510,330);                                     // Weiter nach links (Stromst�rkemessger�t, rechte Buchse)
  ctx.moveTo(490,330);                                     // Neuer Anfangspunkt (Stromst�rkemessger�t, linke Buchse)
  ctx.lineTo(440,330);                                     // Weiter nach links
  ctx.lineTo(440,220);                                     // Weiter nach oben
  ctx.lineTo(540,220);                                     // Weiter nach rechts
  ctx.lineTo(540,140);                                     // Weiter nach oben
  ctx.lineTo(520,140);                                     // Weiter nach links (Verst�rkerausgang, untere Buchse)
  ctx.stroke();                                            // Dr�hte zeichnen
  }
  
// Diagramm: Gegenspannung als Funktion der Frequenz
// (x,y) ... Ursprung (Pixel)

function diagram (x, y) {
  newPath();
  arrow(x-10,y,x+160,y);                                   // Frequenz-Achse (waagrecht)
  write(symbolFrequency,x+158,y+16,1);                     // Symbol f�r Frequenz
  write(text11,x+158,y+28,1);                              // Angabe der Einheit (THz)
  line(x+120,y-3,x+120,y+3);                               // Tick 1000 THz
  write("1000",x+120,y+16,1);                              // Beschriftung 1000 THz
  line(x+60,y-2,x+60,y+2);                                 // Tick 500 THz
  write("500",x+60,y+16,1);                                // Beschriftung 500 THz
  arrow(x,y+110,x,y-120);                                  // Spannungs-Achse (senkrecht)
  write(symbolVoltage,x-6,y-110,2);                        // Symbol f�r Spannung
  write(text12,x+6,y-110,0);                               // Angabe der Einheit (V)
  for (var i=-2; i<=2; i++) {                              // F�r alle ganzzahligen Volt-Werte ... 
    if (i == 0) continue;                                  // Angabe 0 V �berspringen
    line(x-3,y-i*pixY,x+3,y-i*pixY);                       // Tick zeichnen
    write(""+i,x-5,y-i*pixY+5,2);                          // Tick beschriften
    }
  for (i=-5; i<=5; i+=2)                                   // F�r alle halbzahligen Volt-Werte ...
    line(x-2,y-i*18,x+2,y-i*18);                           // Tick zeichnen
  for (i=0; i<numberMat; i++) {                            // F�r alle Kathodenmaterialien ...
    if (!seriesEnded[i]) continue;                         // Falls Messreihe noch nicht beendet, n�chstes Material
    var y0 = y+pixY*wMat[i];                               // y-Koordinate f�r Frequenz 0 (Pixel)
    var y1 = y-pixY*(h*1.3e15/e-wMat[i]);                  // y-Koordinate f�r Frequenz 1300 THz (Pixel)      
    line(x,y0,x+1.3*pixX,y1);                              // Gerade zeichnen
    }
  for (i=0; i<numberMat; i++)                              // F�r alle Kathodenmaterialien ...
    for (var j=0; j<numberLines; j++) {                    // F�r alle Spektrallinien ...
      if (measured[i][j]) {                                // Falls Messung schn durchgef�hrt ...
        var c = (i==0 ? colorCs : colorNa);                // Farbe je nach Kathodenmaterial
        rectangle(xM[j]-1.5,yM[i][j]-1.5,3,3,c);           // Rechteck zeichnen
        }
      }
  }
  
// Kommentar:
// (x,y) ... Position f�r Anfang der ersten Zeile (Pixel)
  
function comment (x, y) {
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  ctx.textAlign = "left";                                  // Textausrichtung linksb�ndig
  var a = text13[iComm];                                   // Array der Textzeilen
  for (var i=0; i<a.length; i++)                           // F�r alle Zeilen ...
    ctx.fillText(a[i],x,y+i*15);                           // Zeile ausgeben
  }
  
// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  circuitLamp();                                           // Stromkreis der Hg-Lampe                               
  opticalSystem();                                         // Optisches System
  photoCell(280,80);                                       // Photozelle
  potentiometer(320,180,voltage/3);                        // Potentiometerschaltung
  resistor(390,130,20,60);                                 // Widerstand bei Kondensator 
  meter(colorVoltage,320,330,voltage/3);                   // Messger�t f�r Gegenspannung
  condensator(430,80);                                     // Kondensator
  amplifier(500,130);                                      // Verst�rker
  var part = 1-voltage/eKin;                               // Bruchteil f�r Stromst�rkemessung
  if (eKin <= 0 || part < 0) part = 0;                     // Zu kleine Werte verhindern
  if (part > 0 && voltage > eKin-tol) part = 0;            // Zu gro�e Werte verhindern
  meter(colorAmperage,500,330,part);                       // Messger�t f�r Stromst�rke
  wires();                                                 // Dr�hte
  diagram(30,280);                                         // Diagramm 
  comment(260,380);                                        // Kommentar
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


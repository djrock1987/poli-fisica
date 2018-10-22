// Elektromagnetische Welle
// Java-Applet (20.09.1999) nach Javascript übertragen
// 23.03.2014 - 14.12.2017

// Konstanten und Variable:

var uM = 120, vM = 180;                                    // Bildschirmkoordinaten Ursprung
var theta = 15*Math.PI/180, phi = 40*Math.PI/180;          // Winkel für Projektion (Bogenmaß)
var a1, a2, b1, b2, b3;                                    // Koeffizienten für Projektion
var omega = 2*Math.PI/30;                                  // Kreisfrequenz (1/s); entspricht Periode 30 s
var k = 2*Math.PI/12;                                      // Wellenzahl
var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var colorE = "red", colorB = "blue";                       // Farben für E-Feld und B-Feld
var t0;                                                    // Anfangszeitpunkt (ms)
var t;                                                     // Aktuelle Zeit (s)

// Start:

function start () {
  var sin = Math.sin(theta), cos = Math.cos(theta);        // Trigonometrische Werte
  var f = 15;                                              // Faktor
  a1 = -f*Math.sin(phi); a2 = f*Math.cos(phi);             // Koeffizienten für Projektion (nach "rechts")
  b1 = -sin*a2; b2 = sin*a1; b3 = f*cos;                   // Koeffizienten für Projektion (nach "oben")
  canvas = document.getElementById("cv");                  // Zeichenfläche
  ctx = canvas.getContext("2d");                           // Grafikkontext
  ctx.font = "normal normal bold 12px sans-serif";         // Zeichensatz
  setInterval(updateCanvas,40);                            // Timer-Intervall 0,040 s
  t0 = new Date();                                         // Anfangszeitpunkt (ms)
  }
   
// Pfeil zeichnen:
// ctx ....... Grafikkontext
// (x0,y0) ... Anfangspunkt
// (x1,y1) ... Endpunkt
// d ......... Liniendicke
// Farbe vorgegeben durch ctx.strokeStyle; Seiteneffekt ctx.fillStyle
  
function arrow (ctx, x0, y0, x1, y1, /* optional */ d) {
  if (d == undefined) d = 1;                     // Default-Liniendicke
  ctx.beginPath();                               // Neuer Pfad
  ctx.moveTo(x0,y0);                             // Anfangspunkt
  var dx = x1-x0, dy = y1-y0;                    // Koordinaten des Richtungsvektors
  var length = Math.sqrt(dx*dx+dy*dy);           // Länge des Pfeils
  if (length < 5) {                              // Pfeil sehr kurz?
    ctx.lineTo(x1,y1);                           // Linie zum Endpunkt
    ctx.stroke();                                // Linie zeichnen
    return;                                      // Abbruch (keine Pfeilspitze zeichnen)                       
    }
  ctx.fillStyle = ctx.strokeStyle;               // Füllfarbe für Pfeilspitze
  dx /= length; dy /= length;                    // Einheitsvektor
  ctx.lineWidth = d;                             // Liniendicke
  var s = 2.5*d+7.5;                             // Länge der Pfeilspitze 
  var xSp = x1-s*dx, ySp = y1-s*dy;              // Hilfspunkt für Pfeilspitze         
  var h = 0.5*d+3.5;                             // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;          // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;          // Ecke der Pfeilspitze
  xSp = x1-0.6*s*dx; ySp = y1-0.6*s*dy;          // Einspringende Ecke der Pfeilspitze
  ctx.lineTo(xSp,ySp);                           // Linie (verkürzt)
  ctx.stroke();                                  // Linie zeichnen
  ctx.beginPath();                               // Neuer Pfad (für Pfeilspitze)
  ctx.moveTo(xSp,ySp);                           // Anfangspunkt
  ctx.moveTo(xSp1,ySp1);                         // Zum nächsten Punkt
  ctx.lineTo(x1,y1);                             // Zur Pfeilspitze
  ctx.lineTo(xSp2,ySp2);                         // Zum nächsten Punkt
  ctx.lineTo(xSp,ySp);                           // Zurück zum Anfangspunkt
  ctx.fill();                                    // Pfeilspitze zeichnen
  }
  
// Koordinatensystem:

function axes () {
  ctx.strokeStyle = "black";                               // Linienfarbe schwarz
  ctx.textAlign = "left";                                  // Linksbündiger Text
  ctx.fillStyle = "black";                                 // Füllfarbe schwarz (Text)
  var u = uM+a2*35, v = vM-b2*35;                          // Endpunkt x-Achse (Ausbreitungsrichtung)
  arrow(ctx,uM-a2*2,vM+b2*2,u,v);                          // x-Achse zeichnen
  ctx.fillText("x",u-6,v-6);                               // Beschriftung "x"
  u = uM; v = vM-b3*10;                                    // Endpunkt y-Achse (E-Vektor)
  arrow(ctx,uM,vM+b3*10,u,v);                              // y-Achse zeichnen
  ctx.fillText("y",uM+8,v+8);  	                           // Beschriftung "y"
  u = uM+a1*10; v = vM-b1*10;                              // Endpunkt z-Achse (B-Vektor)    
  arrow(ctx,uM-a1*10,vM+b1*10,u,v);                        // z-Achse zeichnen
  ctx.fillText("z",u,v-6);                                 // Beschriftung "z"    
  }
  
// Pfeile für elektrisches Feld:

function eVectors () {
  ctx.strokeStyle = colorE;                                // Farbe für elektrisches Feld
  for (var y=0; y<30; y++) {                               // Für jeden Vektorpfeil ...
    var e = 8*Math.sin(omega*t-k*y);                       // Elektrische Feldstärke
    var u = uM+a2*y, v = vM-b2*y;                          // Anfangspunkt des Pfeils
    arrow(ctx,u,v,u,v-b3*e,2);                             // Pfeil zeichnen
    }
  }
  
// Pfeile für magnetisches Feld:
// sign ... Vorzeichen (in Bezug auf die positive y-Achse)

function bVectors (sign) {
  ctx.strokeStyle = colorB;                                // Farbe für Magnetfeld
  for (var y=0; y<30; y++) {                               // Für jeden Vektorpfeil ...
    var b = 8*Math.sin(omega*t-k*y);                       // Magnetische Feldstärke
    if (b*sign <= 0) continue;                             // Falls falsche Seite, nicht zeichnen
    var u = uM+a2*y, v = vM-b2*y;                          // Anfangspunkt des Pfeils
    arrow(ctx,u,v,u+a1*b,v-b1*b,2);                        // Pfeil zeichnen
    }  
  }
  
// Sinuskurve für elektrisches Feld:

function eWave () {
  ctx.strokeStyle = colorE;                                // Farbe für elektrisches Feld
  ctx.lineWidth = 1;                                       // Liniendicke 1
  ctx.beginPath();                                         // Neuer Pfad
  var e = 8*Math.sin(omega*t);                             // Elektrische Feldstärke für y = 0
  ctx.moveTo(uM,vM-b3*e);                                  // Anfangspunkt
  for (var yy=1; yy<=300; yy++) {                          // Für jeden Kurvenabschnitt ...
    var y = yy/10;                                         // Hilfsgröße
    e = 8*Math.sin(omega*t-k*y);                           // Elektrische Feldstärke
    ctx.lineTo(uM+a2*y,vM-b2*y-b3*e);                      // Kurve durch kurze Linie ergänzen
    }
  ctx.stroke();                                            // Kurve zeichnen
  }

// Sinuskurve für magnetisches Feld:

function bWave () {
  ctx.strokeStyle = colorB;                                // Farbe für Magnetfeld
  ctx.lineWidth = 1;                                       // Liniendicke 1
  ctx.beginPath();                                         // Neuer Pfad
  var b = 8*Math.sin(omega*t);                             // Magnetische Feldstärke für y = 0
  ctx.moveTo(uM+a1*b,vM-b1*b);                             // Anfangspunkt
  for (var yy=1; yy<=300; yy++) {                          // Für jeden Kurvenabschnitt ...
    var y = yy/10;                                         // Hilfsgröße
    b = 8*Math.sin(omega*t-k*y);                           // Magnetische Feldstärke
    ctx.lineTo(uM+a1*b+a2*y,vM-b1*b-b2*y);                 // Kurve durch kurze Linie ergänzen
    }
  ctx.stroke();                                            // Kurve zeichnen
  }
    
// Zeichenfläche aktualisieren:

function updateCanvas () {
  ctx.fillStyle = "yellow";                                // Hintergrundfarbe
  ctx.fillRect(0,0,canvas.width,canvas.height);            // Hintergrund
  axes();                                                  // Koordinatensystem
  t = (new Date()-t0)/1000;                                // Aktuelle Zeit (s)
  bVectors(-1);                                            // B-Vektoren hinten
  eVectors();                                              // E-Vektoren
  eWave();                                                 // Sinuskurve für E-Feld
  bVectors(+1);                                            // B-Vektoren vorne
  bWave();                                                 // Sinuskurve für B-Feld
  ctx.fillStyle = "black";                                 // Füllfarbe
  ctx.textAlign = "right";                                 // Textausrichtung rechtsbündig
  ctx.fillText("W. Fendt 1999",canvas.width-20,canvas.height-20);
  }
  
document.addEventListener("DOMContentLoaded",start,false);

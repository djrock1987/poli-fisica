// Reflexion und Brechung von Lichtwellen (Huygens-Prinzip), spanische Texte (Prof. Ernesto Martin Rodriguez)
// Letzte Änderung 14.12.2017

// Texte in HTML-Schreibweise:

var text01 = "Reiniciar";
var text02 = "Siguiente Paso";
var text03 = ["Pausa", "Reanuda"];                  
var text04 = "1. &Iacute;ndice de Refracci&oacute;n:";
var text05 = "2. &Iacute;ndice de Refracci&oacute;n:";
var text06 = "&Aacute;ngulo de Incidencia:";

var author = "W. Fendt 1998";
var translator = "Prof. E. M. Rodriguez 1998";

// Symbole und Einheiten:

var decimalSeparator = ",";                                // Dezimaltrennzeichen (Komma/Punkt)
var degree = "&deg;";                                      // Grad

// Texte in Unicode-Schreibweise:

var text07 = [

  ["Un frente de ondas plano",                             // i == 0 (step == 0, n1 != n2, eps1 > 0)
   "avanza hacia la frontera",
   "entre dos medios, 1 y 2.",
   "La onda viaja con diferente",
   "velocidad en cada medio."],
   
  ["Un frente de ondas plano",                             // i == 1 (step == 0, n1 != n2, eps1 == 0)
   "avanza perpendicularmente",
   "hacia la frontera entre dos",
   "medios, 1 y 2.",
   "La onda viaja con diferente",
   "velocidad en cada medio."],
   
  ["Al llegar el frente a la frontera",                    // i == 2 (step == 1, n1 > n2)
   "sus puntos, de acuerdo con",
   "el Principio de Huygens, se",
   "comportan como emisores de",
   "ondas esfericas elementales.",
   "En el medio 2 estas ondas",
   "viajan mas rapido que en el 1",
   "ya que su indice de refracci\u00f3n",
   "es menor que el de 1."],
 
  ["Al llegar el frente a la frontera",                    // i == 3 (step == 1, n1 < n2)
   "sus puntos, de acuerdo con",
   "el Principio de Huygens, se",
   "comportan como emisores de",
   "ondas esfericas elementales.",
   "En el medio 2 estas ondas",
   "viajan mas lentamente que en",
   "el 1 ya que su indice de re-",
   "fracci\u00f3n es mayor que el de 1."],
 
  ["La superposici\u00f3n de todas las",                   // i == 4 (step == 2, total == false, esp1 > 0)
   "ondas elementales da una",
   "nueva onda plana, cuyo frente",
   "es la envolvente de las ondas",
   "esfericas. Observese que el",
   "frente cambia la direcci\u00f3n de",
   "propagaci\u00f3n al pasar del medio",
   "1 al 2."],

  ["La superposici\u00f3n de todas las",                   // i == 5 (step == 2, total == false, esp1 == 0)
   "ondas elementales da una",
   "nueva onda plana."],

  ["La superposici\u00f3n de todas las",                   // i == 6 (step == 2, total == true)
   "ondas elementales da una",
   "nueva onda plana en el medio 1",
   "(onda reflejada).",
   "La onda no se transmite al",
   "medio 2 (reflexi\u00f3n total interna)."],
   
  ["Ahora se dibuja la direcci\u00f3n",                    // i == 7 (step == 3)
   "de propagaci\u00f3n de la onda.",
   "Esta recta -rayo- es la",
   "perpendicular al frente de",
   "ondas."],
   
  ["Pero un frente de ondas",                              // i == 8 (step == 4)
   "raramente viene solo!"],

  ["Si el indice de refracci\u00f3n de",                   // i == 9 (n1 == n2)
   "ambos medios es el mismo ...",
   "No sucede nada especial."]];
          
var text08 = "\u00c1ngulo de Incidencia:"; 
var text09 = "\u00c1ngulo de Reflexi\u00f3n:";
var text10 = "\u00c1ngulo de Transmisi\u00f3n:"; 
var text11 = "Medio 1";
var text12 = "Medio 2";      
var text13 = ["\u00c1ngulo Critico para", "Reflexi\u00f3n Total:"];

// Einheiten:

var degreeUnicode = "\u00b0";                              // Grad

/**
 * Datos de demostración. Los títulos y fichas técnicas son datos públicos de cada juego;
 * todos los textos de reseñas, las revistas ("PixelPress", "Modo Retro", "Control Total")
 * y los usuarios son ficticios y fueron escritos para este proyecto.
 *
 * Cuentas de prueba (contraseña entre paréntesis):
 *   admin@tgr.test        (admin12345)   Administrador
 *   editor@tgr.test       (editor12345)  Editor de TGR (reseñas oficiales)
 *   pixelpress@tgr.test   (revista12345) Editor de la revista PixelPress  (escala /10)
 *   modoretro@tgr.test    (revista12345) Editor de la revista Modo Retro  (escala /100)
 *   controltotal@tgr.test (revista12345) Editor de la revista Control Total (escala /5)
 *   ana@tgr.test          (usuario12345) Usuario registrado
 *   troll@tgr.test        (usuario12345) Usuario suspendido (RN7)
 */

export const USERS = [
	{ username: 'admin', email: 'admin@tgr.test', password: 'admin12345', role: 'admin' },
	{ username: 'sofia_tgr', email: 'editor@tgr.test', password: 'editor12345', role: 'editor' },
	{ username: 'pixelpress', email: 'pixelpress@tgr.test', password: 'revista12345', role: 'editor', outlet: 'PixelPress' },
	{ username: 'modoretro', email: 'modoretro@tgr.test', password: 'revista12345', role: 'editor', outlet: 'Modo Retro' },
	{ username: 'controltotal', email: 'controltotal@tgr.test', password: 'revista12345', role: 'editor', outlet: 'Control Total' },
	{ username: 'ana', email: 'ana@tgr.test', password: 'usuario12345' },
	{ username: 'luis_gg', email: 'luis@tgr.test', password: 'usuario12345' },
	{ username: 'mariana', email: 'mariana@tgr.test', password: 'usuario12345' },
	{ username: 'kevin8bit', email: 'kevin@tgr.test', password: 'usuario12345' },
	{ username: 'dani_speedrun', email: 'dani@tgr.test', password: 'usuario12345' },
	{ username: 'fer', email: 'fer@tgr.test', password: 'usuario12345' },
	{ username: 'rodrigo', email: 'rodrigo@tgr.test', password: 'usuario12345' },
	{ username: 'troll99', email: 'troll@tgr.test', password: 'usuario12345', status: 'suspended' }
];

/**
 * Portadas: enlaces a la imagen del artículo de Wikipedia de cada juego (no se copian al repositorio).
 * Las portadas pertenecen a sus editoras; se usan sólo con fines educativos en este proyecto escolar.
 * Si un juego no tiene enlace, o la imagen no carga, se muestra la portada generada con su color.
 */
const W = 'https://upload.wikimedia.org/wikipedia/';
export const COVERS = {
	'Hollow Knight': W + 'en/d/de/Hollow_Knight_2026_cover_art.jpg',
	'The Legend of Zelda: Tears of the Kingdom': W + 'en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg',
	'Elden Ring': W + 'en/b/b9/Elden_Ring_Box_art.jpg',
	Celeste: W + 'commons/0/0f/Celeste_box_art_full.png',
	Hades: W + 'en/c/cc/Hades_cover_art.jpg',
	'Super Mario World': W + 'en/3/32/Super_Mario_World_Coverart.png',
	'Chrono Trigger': W + 'en/a/a7/Chrono_Trigger.jpg',
	"Baldur's Gate 3": W + 'en/1/12/Baldur%27s_Gate_3_cover_art.jpg',
	'Metroid Prime Remastered': W + 'en/b/ba/MetroidPrimebox.jpg',
	'Sonic the Hedgehog': W + 'en/b/ba/Sonic_the_Hedgehog_1_Genesis_box_art.jpg',
	Balatro: W + 'en/8/89/Balatro_cover.jpg',
	'Astro Bot': W + 'en/a/a9/Astro_Bot_cover_art.jpg',
	'Street Fighter 6': W + 'en/9/94/Street_Fighter_6_box_art.jpg',
	'Half-Life 2': W + 'en/2/25/Half-Life_2_cover.jpg',
	Tetris: W + 'en/4/4a/Tetris_Boxshot.jpg'
};

/** [título, género, año, desarrollador, plataformas, tono de portada, sinopsis] */
export const GAMES = [
	['Hollow Knight', 'Metroidvania', 2017, 'Team Cherry', ['PC', 'Switch', 'PS4', 'Xbox One'], 215, 'Un caballero sin nombre desciende al reino en ruinas de Hallownest, un laberinto subterráneo lleno de insectos, secretos y jefes exigentes.'],
	['The Legend of Zelda: Tears of the Kingdom', 'Aventura', 2023, 'Nintendo', ['Switch'], 140, 'Link explora Hyrule, sus islas en el cielo y las profundidades, construyendo artefactos con la habilidad Ultramano.'],
	['Elden Ring', 'RPG de acción', 2022, 'FromSoftware', ['PC', 'PS5', 'Xbox Series'], 40, 'Un mundo abierto oscuro donde el Sinluz busca reparar el Círculo de Elden enfrentando semidioses.'],
	['Celeste', 'Plataformas', 2018, 'Maddy Makes Games', ['PC', 'Switch', 'PS4', 'Xbox One'], 330, 'Madeline escala la montaña Celeste en un plataformas de precisión que habla de ansiedad y perseverancia.'],
	['Hades', 'Roguelike', 2020, 'Supergiant Games', ['PC', 'Switch', 'PS5', 'Xbox Series'], 5, 'Zagreo intenta escapar del inframundo una y otra vez, con ayuda de los dioses del Olimpo.'],
	['Super Mario World', 'Plataformas', 1990, 'Nintendo', ['SNES'], 120, 'Mario y Yoshi recorren Dinosaur Land en uno de los plataformas más influyentes de la era de 16 bits.'],
	['Chrono Trigger', 'RPG', 1995, 'Square', ['SNES'], 25, 'Un grupo de héroes viaja por distintas eras para impedir el fin del mundo, con múltiples finales.'],
	['Stardew Valley', 'Simulación', 2016, 'ConcernedApe', ['PC', 'Switch', 'PS4', 'Xbox One', 'Móvil'], 95, 'Heredas una granja en Pelican Town: cultiva, pesca, explora minas y conoce al pueblo.'],
	["Baldur's Gate 3", 'RPG', 2023, 'Larian Studios', ['PC', 'PS5', 'Xbox Series'], 280, 'Un RPG por turnos basado en las reglas de D&D 5e, con decisiones que cambian radicalmente la historia.'],
	['Metroid Prime Remastered', 'Acción-aventura', 2023, 'Retro Studios', ['Switch'], 15, 'Samus Aran explora Tallon IV en primera persona, en una remasterización visual del clásico de 2002.'],
	['Sonic the Hedgehog', 'Plataformas', 1991, 'Sonic Team', ['Genesis'], 220, 'El erizo azul corre a toda velocidad para detener al Dr. Robotnik y liberar a sus amigos.'],
	['Balatro', 'Roguelike', 2024, 'LocalThunk', ['PC', 'Switch', 'PS5', 'Xbox Series', 'Móvil'], 350, 'Un roguelike de construcción de mazos inspirado en el póker, con comodines que rompen las reglas.'],
	['Astro Bot', 'Plataformas', 2024, 'Team Asobi', ['PS5'], 195, 'Astro recorre galaxias para rescatar a su tripulación en un plataformas 3D lleno de ideas.'],
	['Street Fighter 6', 'Peleas', 2023, 'Capcom', ['PC', 'PS5', 'Xbox Series'], 0, 'La saga de peleas regresa con controles modernos, el sistema Drive y un modo historia de mundo abierto.'],
	['Half-Life 2', 'Shooter', 2004, 'Valve', ['PC'], 30, 'Gordon Freeman llega a City 17 para unirse a la resistencia contra el Combine.'],
	['Tetris', 'Puzzle', 1989, 'Nintendo', ['Game Boy'], 170, 'La versión portátil que llevó el rompecabezas de bloques a millones de personas.']
];

/** Reseñas oficiales de TGR (escala /5). Clave: título del juego. */
export const OFFICIAL = {
	'Hollow Knight': {
		title: 'Un descenso inolvidable a Hallownest',
		score: 4.8,
		body: `## Un mundo que se explora con curiosidad\nHollow Knight confía en el jugador: no hay flechas ni marcadores, sólo un mapa que tienes que **comprar y completar** tú mismo. Cada zona tiene identidad visual y musical propia, y regresar a un lugar con una nueva habilidad se siente como descubrirlo otra vez.\n\n## Combate exigente pero justo\nLos jefes castigan los errores, pero siempre entiendes por qué perdiste. Los amuletos permiten adaptar el estilo de juego sin romper el equilibrio.\n\n## ¿Para quién es?\nPara quien disfruta perderse y aprender de cada intento. Si buscas una experiencia guiada, puede resultar frustrante al inicio.`,
		pros: 'Dirección de arte y música sobresalientes\nMapa enorme y lleno de secretos\nJefes memorables\nMucho contenido por su precio',
		cons: 'Poca orientación en las primeras horas\nRegresar tras morir puede ser tedioso',
		verdict: 'Una obra maestra del metroidvania moderno que recompensa la paciencia y la curiosidad.'
	},
	'The Legend of Zelda: Tears of the Kingdom': {
		title: 'Construir, volar y volver a perderse en Hyrule',
		score: 4.9,
		body: `## Más que una secuela\nTears of the Kingdom reutiliza el mapa de su antecesor, pero lo multiplica con islas en el cielo y unas profundidades del mismo tamaño que la superficie. La sensación de descubrimiento sigue intacta.\n\n## Ultramano: la estrella del juego\nUnir troncos, ventiladores y ruedas para crear vehículos convierte cada problema en un laboratorio. Casi cualquier solución que se te ocurra **funciona**.\n\n## Detalles técnicos\nEn Switch hay caídas de cuadros en zonas cargadas, pero rara vez afectan la jugabilidad.`,
		pros: 'Libertad creativa enorme\nExploración vertical en tres capas\nHistoria mejor contada que en Breath of the Wild',
		cons: 'Rendimiento irregular en algunas zonas\nMenús de materiales algo lentos',
		verdict: 'Una aventura que redefine lo que puede ser un mundo abierto. Imprescindible en Switch.'
	},
	'Elden Ring': {
		title: 'El mundo abierto según FromSoftware',
		score: 4.7,
		body: `## Libertad para elegir tu reto\nSi un jefe te bloquea, puedes irte a explorar y volver más fuerte. Esa libertad hace que Elden Ring sea el juego más accesible del estudio sin perder su identidad.\n\n## Diseño de mazmorras\nLos castillos principales están entre lo mejor que ha hecho FromSoftware. Las catacumbas secundarias, en cambio, se repiten más de la cuenta.\n\n## Construcciones (builds)\nMagia, fe, fuerza o destreza: todas son viables y cambian por completo la experiencia.`,
		pros: 'Exploración con sorpresas constantes\nGran variedad de estilos de juego\nJefes espectaculares',
		cons: 'Mazmorras secundarias repetitivas\nHistoria muy críptica',
		verdict: 'Un hito del género que combina desafío y libertad como pocos juegos.'
	},
	Celeste: {
		title: 'Precisión y corazón en la montaña',
		score: 4.6,
		body: `## Controles perfectos\nCada salto y cada impulso responden exactamente como esperas. Cuando fallas, sabes que fue tu error y reapareces al instante.\n\n## Una historia que importa\nLa escalada de Madeline es una metáfora sobre la ansiedad tratada con respeto y sin dramatismo forzado.\n\n## Accesibilidad\nEl **modo asistencia** permite reducir la velocidad o volverse invencible, para que nadie se quede sin terminar la historia.`,
		pros: 'Controles impecables\nBanda sonora excelente\nOpciones de accesibilidad ejemplares',
		cons: 'Los niveles finales pueden ser muy difíciles para algunos',
		verdict: 'Un plataformas brillante que además tiene algo importante que decir.'
	},
	Hades: {
		title: 'Morir nunca fue tan divertido',
		score: 4.8,
		body: `## Un roguelike con narrativa\nCada vez que Zagreo muere, la historia avanza. Los diálogos cambian según lo que hiciste y casi nunca se repiten.\n\n## Combate fluido\nSeis armas con variantes y bendiciones de los dioses dan combinaciones distintas en cada intento.\n\n## Progresión\nIncluso una mala partida deja recursos para mejorar, así que siempre sientes avance.`,
		pros: 'Narrativa integrada al bucle de juego\nCombate rápido y variado\nArte y voces de gran nivel',
		cons: 'Los biomas se vuelven familiares tras muchas horas',
		verdict: 'El estándar con el que se mide a los roguelikes narrativos.'
	},
	'Super Mario World': {
		title: 'El clásico de 16 bits que sigue enseñando',
		score: 4.5,
		body: `## Diseño de niveles atemporal\nCada nivel presenta una idea, la desarrolla y la remata. Las salidas secretas invitan a rejugar el mapa completo.\n\n## Yoshi\nLa incorporación de Yoshi añade movilidad y capas de estrategia sin complicar los controles.\n\n## Cómo jugarlo hoy\nDisponible en los servicios clásicos de Nintendo; se mantiene igual de disfrutable.`,
		pros: 'Diseño de niveles magistral\nMuchos secretos y salidas alternativas\nControles precisos',
		cons: 'Dificultad baja en la mayoría del juego para jugadores actuales',
		verdict: 'Un pilar de los plataformas que todo jugador debería conocer.'
	},
	'Chrono Trigger': {
		title: 'Viajar en el tiempo nunca envejece',
		score: 4.7,
		body: `## Ritmo ejemplar\nChrono Trigger no tiene relleno: cada era aporta personajes y giros, y el juego respeta tu tiempo.\n\n## Combates sin transiciones\nLas peleas ocurren en el mismo escenario y las técnicas combinadas entre personajes siguen siendo un gran sistema.\n\n## Rejugabilidad\nLa **Nueva Partida+** y sus múltiples finales lo convierten en un juego para volver.`,
		pros: 'Historia y personajes entrañables\nSistema de técnicas combinadas\nMúltiples finales',
		cons: 'Algunas mazmorras se sienten cortas\nPoca dificultad en la segunda mitad',
		verdict: 'Uno de los mejores RPG japoneses jamás hechos.'
	},
	'Stardew Valley': {
		title: 'La vida tranquila que no sabías que necesitabas',
		score: 4.6,
		body: `## Un bucle relajante\nSembrar, cosechar, pescar y bajar a la mina: cada día es corto y siempre hay "un día más" por jugar.\n\n## Un pueblo con vida\nLos habitantes tienen rutinas, historias y eventos que se desbloquean conforme haces amistad.\n\n## Cooperativo\nEl modo para varios jugadores convierte la granja en un proyecto compartido.`,
		pros: 'Enorme cantidad de contenido\nActualizaciones gratuitas constantes\nCooperativo muy divertido',
		cons: 'El inicio puede sentirse lento\nGestión del inventario mejorable',
		verdict: 'El juego de granja definitivo, hecho con cariño por una sola persona.'
	},
	"Baldur's Gate 3": {
		title: 'Tus decisiones sí importan',
		score: 4.9,
		body: `## Reactividad sin igual\nCasi cualquier problema tiene varias soluciones: combate, diálogo, sigilo o ingenio con el entorno. El juego reacciona a todo.\n\n## Compañeros memorables\nCada personaje tiene una historia propia que cambia según tus decisiones.\n\n## Combate por turnos\nEl sistema de D&D 5e se traduce muy bien al videojuego, con verticalidad y uso del escenario.`,
		pros: 'Libertad y reactividad excepcionales\nPersonajes muy bien escritos\nCooperativo completo',
		cons: 'El tercer acto tiene problemas de rendimiento\nCurva de aprendizaje para quien no conoce D&D',
		verdict: 'Un referente del RPG que tardará años en ser superado.'
	},
	'Metroid Prime Remastered': {
		title: 'Tallon IV, más bello que nunca',
		score: 4.6,
		body: `## Una remasterización ejemplar\nTexturas, iluminación y modelos rehechos, pero con el diseño original intacto. Se siente como recuerdas el juego, no como era.\n\n## Controles modernos\nIncluye control con doble palanca, giroscopio y la opción clásica.\n\n## Atmósfera\nEl escáner de Samus convierte la exploración en arqueología espacial.`,
		pros: 'Mejora visual impresionante\nVarias opciones de control\nAtmósfera inigualable',
		cons: 'La búsqueda final de artefactos alarga el cierre',
		verdict: 'La mejor forma de jugar uno de los grandes clásicos de Nintendo.'
	},
	Balatro: {
		title: 'El póker como nunca lo habías jugado',
		score: 4.5,
		body: `## Fácil de aprender\nSi conoces las manos de póker, ya sabes jugar. La profundidad llega con los comodines, que multiplican puntos de formas cada vez más absurdas.\n\n## "Una partida más"\nLas partidas son cortas y cada combinación nueva te empuja a intentar otra vez.\n\n## Presentación\nEstilo retro con efecto CRT y una banda sonora hipnótica.`,
		pros: 'Muy adictivo\nEnorme variedad de comodines\nPartidas cortas ideales para portátil',
		cons: 'La suerte pesa mucho en algunas partidas',
		verdict: 'Un roguelike pequeño en tamaño y gigante en diversión.'
	},
	'Astro Bot': {
		title: 'Una carta de amor a los plataformas',
		score: 4.7,
		body: `## Ideas en cada nivel\nCada mundo presenta una mecánica nueva y la abandona antes de que se vuelva repetitiva.\n\n## DualSense al máximo\nLa retroalimentación háptica y los gatillos adaptativos se usan con intención, no como truco.\n\n## Para todas las edades\nAccesible para niños, pero con niveles opcionales que retan a cualquier veterano.`,
		pros: 'Creatividad constante\nUso ejemplar del control DualSense\nRitmo perfecto',
		cons: 'Duración algo corta para su precio',
		verdict: 'El mejor exclusivo de plataformas de PS5.'
	}
};

/** Reseñas de revistas afiliadas (RN4/RN5) — [juego, revista, calificación] en la escala de la revista. */
export const OUTLET = [
	['Hollow Knight', 'PixelPress', 9.5, 'Hallownest es enorme, triste y precioso. Un metroidvania que se gana cada elogio con jefes impecables y un mundo que da gusto explorar sin guía.'],
	['Hollow Knight', 'Modo Retro', 94, 'Recupera el espíritu de los clásicos de 16 bits con una dirección artística propia. Exigente, pero siempre justo.'],
	['Hollow Knight', 'Control Total', 4.5, 'Un juego para tomarse con calma. Las primeras horas desconciertan, pero luego no puedes soltarlo.'],
	['The Legend of Zelda: Tears of the Kingdom', 'PixelPress', 10, 'Ultramano convierte Hyrule en un taller infinito. Pocas veces un juego da tanta libertad sin perder el rumbo.'],
	['The Legend of Zelda: Tears of the Kingdom', 'Control Total', 5, 'Exploración en tres capas, puzles creativos y una historia más presente. Perfecto.'],
	['Elden Ring', 'PixelPress', 9.5, 'FromSoftware lleva su fórmula a un mundo abierto lleno de secretos. Difícil, generoso y memorable.'],
	['Elden Ring', 'Modo Retro', 92, 'Un mundo abierto que premia la curiosidad. Las mazmorras secundarias se repiten, pero el conjunto es enorme.'],
	['Celeste', 'Control Total', 4.5, 'Controles precisos y una historia sincera. Su modo asistencia debería copiarse en todos los juegos.'],
	['Celeste', 'PixelPress', 9, 'Plataformas de precisión con un corazón enorme y una banda sonora que no se olvida.'],
	['Hades', 'PixelPress', 9.5, 'El roguelike que hasta quienes odian el género pueden disfrutar. La narrativa es el gancho perfecto.'],
	['Hades', 'Control Total', 5, 'Cada muerte cuenta un poco más de la historia. Combate fluido y personajes encantadores.'],
	['Super Mario World', 'Modo Retro', 96, 'Un manual de diseño de niveles que no envejece. Las salidas secretas siguen sorprendiendo.'],
	['Chrono Trigger', 'Modo Retro', 98, 'El RPG de 16 bits por excelencia: ritmo perfecto, personajes inolvidables y múltiples finales.'],
	['Stardew Valley', 'Control Total', 4.5, 'Relajante y profundo. Ideal para jugar un rato cada noche… o toda la noche.'],
	["Baldur's Gate 3", 'PixelPress', 10, 'Cualquier idea que tengas, el juego la contempla. Un RPG de una ambición pocas veces vista.'],
	["Baldur's Gate 3", 'Control Total', 4.5, 'Libertad absoluta y compañeros entrañables. El tercer acto necesita optimización.'],
	['Metroid Prime Remastered', 'Modo Retro', 93, 'Así se remasteriza un clásico: respetando el diseño y renovando todo lo demás.'],
	['Sonic the Hedgehog', 'Modo Retro', 85, 'Velocidad y actitud que marcaron una época. Algunos niveles frenan demasiado el ritmo.'],
	['Balatro', 'PixelPress', 9, 'Pocas reglas, muchísimas combinaciones. Peligrosamente adictivo.'],
	['Astro Bot', 'PixelPress', 9.5, 'Imaginación desbordada en cada nivel y un uso brillante del DualSense.'],
	['Street Fighter 6', 'Control Total', 4.5, 'Los controles modernos abren el género a nuevos jugadores sin quitar profundidad a los veteranos.'],
	['Half-Life 2', 'Modo Retro', 96, 'La física, el ritmo y City 17 siguen siendo un referente del shooter narrativo.'],
	['Tetris', 'Modo Retro', 90, 'La versión que hizo de Tetris un fenómeno portátil. Simple, perfecto y eterno.']
];

/** Calificaciones de la comunidad: juego → estrellas de los usuarios (en el orden de RATERS). */
export const RATERS = ['ana', 'luis_gg', 'mariana', 'kevin8bit', 'dani_speedrun', 'fer', 'rodrigo'];
export const RATINGS = {
	'Hollow Knight': [5, 5, 4, 5, 5, 4, 5],
	'The Legend of Zelda: Tears of the Kingdom': [5, 4, 5, 5, 4, 5],
	'Elden Ring': [5, 4, 3, 5, 5, 4],
	Celeste: [5, 4, 5, 4, 5],
	Hades: [5, 5, 5, 4, 4, 5, 5],
	'Super Mario World': [5, 4, 4, 5, 4],
	'Chrono Trigger': [5, 5, 4],
	'Stardew Valley': [4, 5, 5, 4, 3, 5],
	"Baldur's Gate 3": [5, 5, 4, 5, 5],
	Balatro: [4, 5, 4],
	'Astro Bot': [5, 4]
};

/** Comentarios: [juego, usuario, texto, oculto] */
export const COMMENTS = [
	['Hollow Knight', 'ana', 'El Panteón de Hallownest me tomó semanas, pero valió cada intento. Totalmente de acuerdo con la reseña.', false],
	['Hollow Knight', 'kevin8bit', 'Consejo: compren el mapa de cada zona con Cornifer lo antes posible, ahorra muchísimo tiempo.', false],
	['Hollow Knight', 'troll99', 'Juego sobrevalorado, el que lo recomiende no sabe nada.', true],
	['Hades', 'mariana', 'Lo empecé sin gustarme los roguelikes y ya llevo 80 horas. Los diálogos son lo mejor.', false],
	['Hades', 'dani_speedrun', 'La lanza con el aspecto de Guan Yu es una locura para speedrun.', false],
	['Elden Ring', 'luis_gg', 'Malenia sigue apareciendo en mis pesadillas. Gran reseña.', false],
	["Baldur's Gate 3", 'fer', 'Jugarlo en cooperativo con amigos es otra experiencia, muy recomendado.', false],
	['Celeste', 'rodrigo', 'Las caras B son un reto increíble después de terminar la historia.', false],
	['Stardew Valley', 'ana', '¡La actualización 1.6 le agregó muchísimo contenido!', false]
];

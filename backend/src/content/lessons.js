// Lesson content in Kinyarwanda (rw), English (en) and French (fr).
// To add a video, put a YouTube embed link in videoUrl, for example
// "https://www.youtube.com/embed/VIDEO_ID". Leave it empty to hide the player.
// Please have a native speaker review the Kinyarwanda and French before launch.

export const LANGS = ['rw', 'en', 'fr'];

export const lessons = [
  {
    id: 'phone-basics',
    icon: '📱',
    videoUrl: { rw: '', en: '', fr: '' },
    title: {
      rw: 'Menya telefone yawe',
      en: 'Getting to know your phone',
      fr: 'Découvrir votre téléphone',
    },
    summary: {
      rw: 'Fungura telefone, uyifungure, unafungure porogaramu.',
      en: 'Switch on, unlock and open apps.',
      fr: 'Allumer, déverrouiller et ouvrir des applications.',
    },
    steps: {
      rw: [
        'Kanda ukomeze ku buto bwo gufungura telefone (power) kugeza ifunguye.',
        'Sunikira ecran hejuru cyangwa uyikoreho urutoki kugira ngo uyifungure.',
        'Utwo dushushanyo duto ku ecran twitwa porogaramu (apps). Koraho kamwe kugira ngo ugafungure.',
        'Gusubira inyuma, kanda akambi k’inyuma cyangwa usunike uhereye ku nkombe ya ecran.',
      ],
      en: [
        'Press and hold the power button until the phone switches on.',
        'Swipe up on the screen, or touch it with your finger, to unlock it.',
        'The small pictures on the screen are called apps. Touch one to open it.',
        'To go back, touch the back arrow or swipe from the edge of the screen.',
      ],
      fr: [
        'Appuyez longuement sur le bouton d’alimentation jusqu’à l’allumage du téléphone.',
        'Faites glisser l’écran vers le haut, ou touchez-le du doigt, pour le déverrouiller.',
        'Les petites images à l’écran s’appellent des applications. Touchez-en une pour l’ouvrir.',
        'Pour revenir en arrière, touchez la flèche de retour ou glissez depuis le bord de l’écran.',
      ],
    },
  },
  {
    id: 'get-online',
    icon: '🌐',
    videoUrl: { rw: '', en: '', fr: '' },
    title: {
      rw: 'Kwinjira kuri interineti',
      en: 'Getting online',
      fr: 'Se connecter à internet',
    },
    summary: {
      rw: 'Koresha WiFi cyangwa interineti ya telefone.',
      en: 'Use WiFi or mobile data.',
      fr: 'Utiliser le WiFi ou les données mobiles.',
    },
    steps: {
      rw: [
        'Fungura Igenamiterere (Settings) kuri telefone yawe.',
        'Kanda kuri WiFi cyangwa kuri Interineti ya telefone (Mobile data).',
        'Niba ukoresha WiFi, hitamo umuyoboro wawe hanyuma wandike ijambobanga.',
        'Fungura porogaramu y’urubuga nka Chrome wandike aderesi y’urubuga urebe ko ikora.',
      ],
      en: [
        'Open Settings on your phone.',
        'Touch WiFi or Mobile data.',
        'For WiFi, choose your network and type the password.',
        'Open a browser such as Chrome and type a website address to check that it works.',
      ],
      fr: [
        'Ouvrez les Paramètres de votre téléphone.',
        'Touchez WiFi ou Données mobiles.',
        'Pour le WiFi, choisissez votre réseau et saisissez le mot de passe.',
        'Ouvrez un navigateur comme Chrome et saisissez une adresse de site pour vérifier que cela fonctionne.',
      ],
    },
  },
  {
    id: 'send-email',
    icon: '✉️',
    videoUrl: { rw: '', en: '', fr: '' },
    title: {
      rw: 'Kohereza imeri',
      en: 'Sending an email',
      fr: 'Envoyer un e-mail',
    },
    summary: {
      rw: 'Andika kandi wohereze imeri ya mbere.',
      en: 'Write and send your first email.',
      fr: 'Écrire et envoyer votre premier e-mail.',
    },
    steps: {
      rw: [
        'Fungura Gmail cyangwa porogaramu yawe ya imeri hanyuma winjire.',
        'Kanda Compose (akamenyetso k’ikaramu cyangwa +).',
        'Mu gasanduku ka To andika imeri y’uwo wandikira. Ongeraho Subject (umutwe) hanyuma wandike ubutumwa bwawe.',
        'Kanda akambi ko kohereza (Send). Imeri yawe iba yoherejwe.',
      ],
      en: [
        'Open Gmail or your email app and sign in.',
        'Touch Compose (the pencil or plus button).',
        'In the To box, type the email address of the person. Add a Subject, then write your message.',
        'Touch the Send arrow. Your email is sent.',
      ],
      fr: [
        'Ouvrez Gmail ou votre application de messagerie et connectez-vous.',
        'Touchez Écrire (le crayon ou le bouton plus).',
        'Dans la case À, saisissez l’adresse de la personne. Ajoutez un Objet, puis écrivez votre message.',
        'Touchez la flèche Envoyer. Votre e-mail est envoyé.',
      ],
    },
  },
  {
    id: 'stay-safe',
    icon: '🔒',
    videoUrl: { rw: '', en: '', fr: '' },
    title: {
      rw: 'Kwirinda ibyago kuri interineti',
      en: 'Staying safe online',
      fr: 'Rester en sécurité en ligne',
    },
    summary: {
      rw: 'Irinde ubujura n’ubutumwa bw’ubwambuzi.',
      en: 'Protect yourself from theft and scams.',
      fr: 'Protégez-vous des vols et des arnaques.',
    },
    steps: {
      rw: [
        'Ntuzigere uha undi muntu ijambobanga ryawe cyangwa PIN yawe.',
        'Kora ijambobanga rirerire rivanze n’inyuguti n’imibare.',
        'Witondere ubutumwa buvuga ko watsindiye amafaranga cyangwa bukwaka amakuru yawe.',
        'Niba hari ikikuvuyemo kidasobanutse, hagarara ubaze umuntu wizeye.',
      ],
      en: [
        'Never share your password or PIN with anyone.',
        'Make passwords long, with a mix of letters and numbers.',
        'Be careful with messages that say you won money or ask for your details.',
        'If something feels wrong, stop and ask someone you trust.',
      ],
      fr: [
        'Ne partagez jamais votre mot de passe ou votre code PIN.',
        'Choisissez des mots de passe longs, mêlant lettres et chiffres.',
        'Méfiez-vous des messages qui annoncent un gain d’argent ou demandent vos informations.',
        'Si quelque chose vous semble anormal, arrêtez et demandez conseil à une personne de confiance.',
      ],
    },
  },
  {
    id: 'video-call',
    icon: '📹',
    videoUrl: { rw: '', en: '', fr: '' },
    title: {
      rw: 'Guhamagara kuri videwo',
      en: 'Making a video call',
      fr: 'Passer un appel vidéo',
    },
    summary: {
      rw: 'Vugana n’umuryango wawe ubabona.',
      en: 'Talk to family and see them.',
      fr: 'Parler à votre famille et la voir.',
    },
    steps: {
      rw: [
        'Fungura WhatsApp cyangwa Google Meet.',
        'Hitamo umuntu ushaka guhamagara.',
        'Kanda ku kamenyetso ka kamera ya videwo.',
        'Emera kamera na mikoro igihe bikubajije. Kanda mute kugira ngo uzimye ijwi ryawe.',
      ],
      en: [
        'Open WhatsApp or Google Meet.',
        'Choose the person you want to call.',
        'Touch the video camera icon.',
        'Allow the camera and microphone when asked. Touch mute to switch off your sound.',
      ],
      fr: [
        'Ouvrez WhatsApp ou Google Meet.',
        'Choisissez la personne à appeler.',
        'Touchez l’icône de caméra vidéo.',
        'Autorisez la caméra et le micro lorsque c’est demandé. Touchez muet pour couper votre son.',
      ],
    },
  },
];

export function localizeLesson(lesson, lang, full = false) {
  const l = LANGS.includes(lang) ? lang : 'rw';
  const base = {
    id: lesson.id,
    icon: lesson.icon,
    title: lesson.title[l],
    summary: lesson.summary[l],
  };
  if (!full) return base;
  return { ...base, steps: lesson.steps[l], videoUrl: lesson.videoUrl[l] || '' };
}

export const getLesson = (id) => lessons.find((x) => x.id === id);

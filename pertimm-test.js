const API_BASE = 'https://hire-game.pertimm.dev/api/v1.1/';
let confirmationUrl = '';

const mail = ''; // à renseigner
const password = ''; // à renseigner
const firstname = ''; // à renseigner
const lastname = '';  // à renseigner

const dataRegistration = { email: mail, password1: password, password2: password };
const dataLogin = { email: mail, password: password };
const dataApplication = { email: mail, first_name: firstname, last_name: lastname};

async function registerAPI() { // Inscription API 
  try {
    const resRegistrer = await fetch(API_BASE + 'auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataRegistration)
    });

    if (resRegistrer.ok) {
      console.log('Inscription réussie');
    }
  } catch (err) {
    console.error('Erreur dans registerAPI: ', err.message);
  }
}

async function loginAPI() { // Connexion API + token personnel
  try {
    const resLogin = await fetch(API_BASE + 'auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataLogin)
    });

    const dataLogin = await res.json();
    if (resLogin.ok) {
      console.log('Connexion réussie et  token récupéré : ' + data.token);
      return data.token;
    }
  } catch (err) {
    console.error('Erreur dans loginAPI : ', err.message);
    throw err;
  }
}

async function createApplication(token) { // création de ma candidature
  try {
    //console.log('token createApplication : ' + token);
    const res = await fetch(API_BASE + 'job-application-request/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify(dataApplication)
    });

    const data = await res.json();
    //console.log(data);

    if (res.ok) {
      console.log('Candidature créée');
      //console.log( data.url);
      return data.url;
    }
  } catch (err) {
    console.error('Erreur dans createApplication: ', err.message);
    throw err;
  }
}

async function getCompletedStatus(url, token) { // recup url de confirmation de la candidature
  const start = Date.now(); // timer

  while (Date.now() - start < 25000) { // < 25s
    const res = await fetch(url, { headers: { Authorization: `Token ${token}` } }); // request GET 
    const data = await res.json();

    if (data.status === 'COMPLETED') { 
       confirmationUrl = data.confirmation_url; // confirmation url
      //console.log('Statut COMPLETED atteint.');
      return;
    }
    
    await new Promise(r => setTimeout(r, 2000)); // attendre 2 secondes avant chaque appel vers l'API !
  }
  //console.error('Temps écoulé');
}

async function confirmApplication(token) { // confirmation
  try {
    const res = await fetch(confirmationUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({ confirmed: true })
    });
    const data = await res.json();

    if (res.ok) {
      console.log('Confirmation réussie');
    } 
  } catch (err) {
    console.error('Erreur dans confirmApplication: ', err.message);
  }
}

async function main() {
  try {
    const start = Date.now(); // garde fou du temps

    // await registerAPI(); 
    const token = await loginAPI();
    const statusUrl = await createApplication(token);
    await getCompletedStatus(statusUrl, token);
    await confirmApplication(token);

    const timer = (Date.now() - start) / 1000;
    //console.log("Compilation du fichier fini en " + timer + " secondes.");
  } catch (err) {
    console.error(err.message);
  }
}

main();

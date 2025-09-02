// URL de base de l'API NiFi déployée sur srv-etl-01 en HTTPS
const NIFI_API_URL = 'https://srv-etl-01:8443/nifi-api';

// Jeton d'authentification obtenu depuis NiFi
let authToken = null;

/**
 * Authentifie l'utilisateur auprès de NiFi et stocke le jeton.
 */
async function login() {
  try {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const resp = await fetch(`${NIFI_API_URL}/access/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      mode: 'cors'
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Échec authentification : ${resp.status} ${text}`);
    }

    authToken = await resp.text();
    if (typeof alert !== 'undefined') {
      alert('Authentification réussie');
    } else {
      console.log('Authentification réussie');
    }
  } catch (error) {
    console.error('Erreur authentification:', error);
    if (typeof alert !== 'undefined') {
      alert(`Erreur: ${error.message}`);
    }
  }
}

/**
 * Trigger a NiFi processor to run once.
 * @param {string} processorId - The UUID of the processor to run.
 */
async function triggerFlow(processorId) {
  try {
    if (!authToken) {
      throw new Error('Veuillez vous authentifier d\'abord');
    }

    // NiFi exige de fournir la révision courante du processeur pour
    // modifier son état. On récupère donc la révision actuelle avant
    // de demander l'exécution.
    const infoResp = await fetch(`${NIFI_API_URL}/processors/${processorId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      mode: 'cors'
    });
    if (!infoResp.ok) {
      const text = await infoResp.text();
      throw new Error(`Impossible de récupérer la révision : ${infoResp.status} ${text}`);
    }

    const processor = await infoResp.json();

    const response = await fetch(`${NIFI_API_URL}/processors/${processorId}/run-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        revision: processor.revision,
        state: 'RUN_ONCE'
      }),
      mode: 'cors'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NiFi response ${response.status}: ${text}`);
    }

    if (typeof alert !== 'undefined') {
      alert('Flux déclenché avec succès');
    } else {
      console.log('Flux déclenché avec succès');
    }
  } catch (error) {
    console.error('Erreur lors du déclenchement du flux:', error);
    if (typeof alert !== 'undefined') {
      alert(`Erreur: ${error.message}`);
    }
  }
}
// Expose the function for both browser and Node.js contexts
if (typeof window !== 'undefined') {
  window.triggerFlow = triggerFlow;
  window.login = login;
}
if (typeof module !== 'undefined') {
  module.exports = { triggerFlow, login };
}

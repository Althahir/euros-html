// URL de base de l'API NiFi déployée sur srv-etl-01 en HTTPS
const NIFI_API_URL = 'https://srv-etl-01:8443/nifi-api';

/**
 * Trigger a NiFi processor to run once.
 * @param {string} processorId - The UUID of the processor to run.
 */
async function triggerFlow(processorId) {
  try {
    // NiFi exige de fournir la révision courante du processeur pour
    // modifier son état. On récupère donc la révision actuelle avant
    // de demander l'exécution.
    const infoResp = await fetch(`${NIFI_API_URL}/processors/${processorId}`);
    if (!infoResp.ok) {
      const text = await infoResp.text();
      throw new Error(`Impossible de récupérer la révision : ${infoResp.status} ${text}`);
    }

    const processor = await infoResp.json();

    const response = await fetch(`${NIFI_API_URL}/processors/${processorId}/run-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        revision: processor.revision,
        state: 'RUN_ONCE'
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NiFi response ${response.status}: ${text}`);
    }

    alert('Flux déclenché avec succès');
  } catch (error) {
    console.error('Erreur lors du déclenchement du flux:', error);
    alert(`Erreur: ${error.message}`);
  }
}
// Expose the function globally so it can be used by inline HTML handlers
window.triggerFlow = triggerFlow;

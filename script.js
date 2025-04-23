async function fetchTides() {
    const location = document.getElementById('locationInput').value;
    const resultDiv = document.getElementById('tideResults');
  
    if (!location) {
      resultDiv.innerHTML = '<p>Veuillez entrer une localisation.</p>';
      return;
    }
  
    try {
      // Étape 1 : Convertir la localisation en coordonnées
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const geoData = await geoResponse.json();
  
      if (geoData.length === 0) {
        resultDiv.innerHTML = '<p>Localisation non trouvée.</p>';
        return;
      }
  
      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      console.log(`Coordonnées pour ${location}: lat=${lat}, lon=${lon}`);
  
      // Étape 2 : Appeler l'API Stormglass pour les extrêmes de marée
      const apiKey = '5a6ffd9e-19f7-11f0-a906-0242ac130003-5a6ffe0c-19f7-11f0-a906-0242ac130003';
      const start = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]; // Yesterday
      const end = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]; // Tomorrow
      const tideResponse = await fetch(
        `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}&start=${start}&end=${end}`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );
  
      // Log the HTTP status and headers
      console.log('HTTP Status:', tideResponse.status);
      console.log('Response Headers:', tideResponse.headers);
  
      // Check if the response is OK
      if (!tideResponse.ok) {
        throw new Error(`Erreur HTTP ${tideResponse.status}: ${tideResponse.statusText}`);
      }
  
      // Parse and log the JSON response
      const tideData = await tideResponse.json();
      console.log('Réponse complète de Stormglass:', tideData);
      if (tideData.data && tideData.data.length > 0) {
        console.log('Premier objet de tideData.data:', tideData.data[0]);
      }
  
      // Vérifier si la réponse contient des données
      if (!tideData.data || tideData.data.length === 0) {
        resultDiv.innerHTML = `<p>Aucune donnée de marée disponible pour ${location}. Essayez une autre localisation côtière ou une date différente.</p>`;
        return;
      }
  
      // Étape 3 : Afficher les résultats
      let output = `<h2>Marées pour ${location}</h2>`;
      let hasValidData = false;
  
      tideData.data.forEach(tide => {
        if (tide.height !== undefined && tide.height !== null) {
          const time = new Date(tide.time).toLocaleString('fr-FR');
          const type = tide.type === 'high' ? 'Pleine mer' : 'Basse mer';
          const coefficient = tide.coefficient !== undefined ? `, Coefficient : ${tide.coefficient}` : ''; // Vérifie si le coefficient est disponible
          output += `<p>${time} : ${tide.height.toFixed(2)} m (${type}${coefficient})</p>`;
          hasValidData = true;
        } else {
          console.log('Donnée invalide:', tide);
        }
      });
  
      if (!hasValidData) {
        resultDiv.innerHTML = `<p>Aucune donnée de marée valide trouvée pour ${location}. Les données renvoyées ne contiennent pas de hauteurs exploitables.</p>`;
        return;
      }
  
      resultDiv.innerHTML = output;
    } catch (error) {
      console.error('Erreur complète:', error);
      resultDiv.innerHTML = `<p>Erreur : ${error.message}</p>`;
    }
  }
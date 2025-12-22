/* ============================
   Language label mapping
============================ */
const languageLabels = {
    nl: 'Nederlands',
    en: 'Engels'
};

/* ============================
   Colors per language
============================ */
const languageColors = {
    Nederlands: '#d27d48',
    Engels: '#5c7F8c',
    Overig: '#cccccc'
};

/* ============================
   Fetch episodes & build chart
============================ */
fetch('episodes.json')
    .then(response => response.json())
    .then(episodes => {

        const languageCount = {};

        episodes.forEach(ep => {
            const rawLang = ep.taal ? ep.taal.toLowerCase() : 'overig';
            const label = languageLabels[rawLang] || 'Overig';

            languageCount[label] = (languageCount[label] || 0) + 1;
        });

        const labels = Object.keys(languageCount);
        const data = Object.values(languageCount);
        const colors = labels.map(label => languageColors[label] || languageColors.Overig);

        const languageChartContext = document
            .getElementById('languageChart')
            .getContext('2d');

        new Chart(languageChartContext, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '50%',
                circumference: 180,
                rotation: 270,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Fout bij laden episodes.json:', error);
    });

const path = require('path');
const fs = require('fs');
const convert = require('xml-js');

const projectRoot = path.resolve(__dirname, '..');

const xmlPath = path.join(projectRoot, 'PARKA/frontend/assets/lots/sf_lots/annotations.xml');
const outputPath = path.join(projectRoot, 'PARKA/frontend/data/parsedLotData.js');
const imageBasePath = '../assets/lots/sf_lots/images/';

try {
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  const jsonData = JSON.parse(convert.xml2json(xmlData, { compact: true, spaces: 2 }));
  
  const images = jsonData.annotations.image;
  const parsedData = {};

  images.forEach(image => {
    const imageName = image._attributes.name.split('/')[1];
    const imageId = imageName.split('.')[0];
    const lotId = `sf_lot_${imageId}`;

    const polygons = Array.isArray(image.polygon) ? image.polygon : [image.polygon];
    
    let openSpots = 0;
    const boundingBoxes = polygons.map(p => {
      const label = p._attributes.label === 'free_parking_space' ? 'empty' : 'car';
      if (label === 'empty') {
        openSpots++;
      }
      
      const points = p._attributes.points.split(';').map(pair => {
        const [x, y] = pair.split(',');
        return { x: parseFloat(x), y: parseFloat(y) };
      });
      
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const xMin = Math.min(...xs);
      const yMin = Math.min(...ys);
      const xMax = Math.max(...xs);
      const yMax = Math.max(...ys);

      return {
        box: [xMin, yMin, xMax - xMin, yMax - yMin],
        label: label,
      };
    });

    parsedData[lotId] = {
      id: lotId,
      name: `SF Lot #${imageId}`,
      image: `require('${imageBasePath}${imageName}')`, // Keep as string for now
      totalSpots: polygons.length,
      openSpots: openSpots,
      aiExplanation: `This lot has ${openSpots} spots available. The best options are located near the center.`,
      boundingBoxes: boundingBoxes,
    };
  });

  // Convert the require strings to actual require calls
  let outputString = `export const lotData = ${JSON.stringify(parsedData, null, 2)};\n`;
  outputString = outputString.replace(/"require\((.*?)\)"/g, 'require($1)');

  outputString += `
export const localLotData = Object.keys(lotData).map(key => ({
  ...lotData[key],
  id: key,
  imageName: \`\${key.split('_')[2]}.png\`,
}));

const localLotDataById = localLotData.reduce((acc, lot) => {
  acc[lot.id] = lot;
  return acc;
}, {});

export const getLotDataByName = (name) => {
  return localLotData.find(lot => lot.name === name) || null;
};

export const getLotDataById = (id) => {
  return localLotDataById[id] || null;
};
`;

  fs.writeFileSync(outputPath, outputString, 'utf8');
  console.log(`Successfully parsed XML and created ${outputPath}`);

} catch (error) {
  console.error("Error parsing XML data:", error);
} 
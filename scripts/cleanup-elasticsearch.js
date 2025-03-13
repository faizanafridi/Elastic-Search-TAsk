const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  nodes: process.env.ELASTICSEARCH_NODES?.split(',') || ['http://localhost:9200']
});

async function cleanupElasticsearch() {
  try {
    console.log('Checking for existing indices...');
    const exists = await client.indices.exists({ index: 'movies' });
    
    if (exists) {
      console.log('Removing existing movies index...');
      await client.indices.delete({ index: 'movies' });
      console.log('Index removed successfully');
    } else {
      console.log('No existing index found');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await client.close();
  }
}

cleanupElasticsearch(); 
import json
import numpy as np
import json
from flask import Flask, request
from flask_cors import CORS
import sqlite3

# This is a mock API service to faciliate development and testing of the RoCKET User Interface
app = Flask('RoCKET Service')
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


def query_database(user_domain,query,params, one=False):
    """Loads data from a sqlite database file.
    params:
        user_domain -- a file name (user +'_'+ domain)
    returns:
        tuple of results and labels
    """
    with sqlite3.connect('./database/'+user_domain+'.db') as connection:
      cur = connection.cursor()
      cur.execute(query,params)
      r = [dict((cur.description[i][0], value) for i, value in enumerate(row)) for row in cur.fetchall()]
      return (r[0] if r else None) if one else r


def exec_database(user_domain,query,params):
    """runs a sql statement on sqlite database.
    params:
        user_domain -- a file name (user +'_'+ domain)
        query -- the database query statement
        params -- the parameters that augment the query statement
    """
    with sqlite3.connect('./database/'+ user_domain+'.db') as connection:
      connection.execute(query,params)
      connection.commit()


def get_search_results( query_str, domain, topn=None ):
  """gets indexed document ids and document contents
  params:
    query_str  --  a single string of comma seperated words, e.g. "james bond,gadgets,MI6,007,moneypenny" for fantasy spy film genre
    domain  --  the data domain, e.g. "movies" for Stanford movie reviews
    topn (optional)  -- the numer of search hits to return, defaults to one
  returns:
    JSON formatted search results based on document key and document content
  """
  from whoosh.qparser import QueryParser
  from whoosh import scoring
  from whoosh.index import open_dir
  ix = open_dir("./search/"+domain+"/indexdir")

  with ix.searcher(weighting=scoring.Frequency) as searcher:
      query = QueryParser("content", ix.schema).parse(query_str)
      results = searcher.search(query,limit=topn)
      print(results)
      results_dict = dict()
      for i in range(len(results)):
          results_dict[results[i]['path']] = results[i]['textdata']
      return json.dumps(results_dict)


# web page that handles user query and displays model results
@app.route('/api/search')
def go():
    # save user input in query
    query_str = request.args.get('query_str', 'james bond')
    domain = request.args.get('domain', 'movies')
    topn = request.args.get('topn', 100)
    return get_search_results(query_str,domain )


@app.route('/api/init')
def init_testuser_databases():
  with sqlite3.connect('./database/testuser_movies.db') as connection:
    connection.execute("""CREATE TABLE IF NOT EXISTS concepts (concept_name TEXT,concept_description  TEXT,keywords TEXT, shown_words TEXT)""")
    connection.execute("""INSERT INTO concepts (concept_name, concept_description, keywords,shown_words) VALUES (?, ?, ?, ?)""", ('spy movies', 'fantasy spy movie films', 'james bond,007,moneypenny,MI6,gadgets',''))
    connection.commit()
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/get_concepts')
def get_concepts():
    """
    Returns the persisted concepts

    Parameters:
       domain --  the common name of the data under review
    """
    domain = request.args.get('domain', 'movies')
    user = request.args.get('user', 'testuser')
    query_results = query_database( user+'_'+domain,"select * from concepts ",())
    return json.dumps(query_results)


@app.route('/api/update_concept')
def update_concept():
  """
    updates the persisted information for a given domain and concept
  
  Parameters:
    domain -- the common name of the data under review
    concept_name -- the user given name of the concept
    concept_description -- the user provided description of the concept
    keywords -- the list of words closely related to the concept
    shown_words -- the list of words that user has 'seen' but not selected
  """
  domain = request.args.get('domain', 'movies')
  user = request.args.get('user', 'testuser')
  concept_name = request.args.get('concept_name', 'spy movies')
  concept_description = request.args.get('concept_description', 'films about fantasy spy movies')
  keywords = request.args.get('keywords', 'james bond,gadgets,MI6,007,moneypenny')
  shown_words = request.args.get('shown_words', '')
  exec_database(user+'_'+domain,"update concepts set concept_description=?,keywords=?,shown_words=? where concept_name=?",(concept_description,keywords,shown_words,concept_name))
  return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/add_concept')
def add_concept():
  """
    persists the newly added concept

    Parameters:
      domain -- the common name of the data under review
      concept_name -- the user given name of the concept
      concept_description -- the user provided description of the concept
    
  """
  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'monty python')
  concept_description = request.args.get('concept_description', 'films about Monty Python')
  keywords = request.args.get('keywords', 'unladened swallow,bouncy bouncy')
  shown_words = request.args.get('shown_words', '')
  exec_database(user+'_'+domain,"INSERT INTO concepts (concept_name, concept_description, keywords,shown_words) VALUES (?, ?, ?, ?)",(concept_name,concept_description,keywords,shown_words))
  return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/delete_concept')
def delete_concept():
  """
    deletes the concept from the persistance layer

    Parameters:
      domain -- the common name of the data under review
      concept_name -- the user given name of the concept
  """
  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'monty python')
  exec_database(user+'_'+domain, "delete from concepts where concept_name=?",(concept_name,))
  return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/get_keywords')
def get_keywords():
  """
    provides the concept's keywords from the persistance layer

    Parameters:
      domain -- the common name of the data under review
      concept_name -- the user given name of the concept

    Returns:
      keywords -- these are displayed below the concept description
  """
  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'spy movies')
  return json.dumps(query_database( user+'_'+domain,"select keywords from concepts where concept_name=?",(concept_name,)))


@app.route('/api/get_nearest_words')
def get_nearest_words():
  """
    provides words closely related to the keywords

    Parameters:
      keywords -- an array of words closely related to the concept
    Returns:
      closest_words -- these are displayed on the right panel of the concept screen
    Testing:
      http://localhost:3001/api/get_nearest_words?keywords=lunch,slice,pie,pasta
  """
  keywords = request.args.get('keywords', '')

  from pymagnitude import Magnitude
  #vectors = Magnitude('http://magnitude.plasticity.ai/word2vec/heavy/GoogleNews-vectors-negative300.magnitude', stream=True) # full url for streaming from 10GB model
  #vectors = Magnitude('http://magnitude.plasticity.ai/glove/light/glove.6B.50d.magnitude', stream=True)
  vectors = Magnitude('./pretrained_features/glove.6B.50d.magnitude')
  
  # there is likely overlap if the concepts words are closely related
  closest_words = set()
  for k in keywords.split(','):
    results = vectors.most_similar(k, topn = 10) # Most similar by key
    #vectors.most_similar(vectors.query(k), topn = 100) # Most similar by vector
    for r in results:
      # just add the word, not the word's probability
      closest_words.add(r[0])
  closest_words = closest_words-set(list(keywords.split(',')))
  return json.dumps(list(closest_words))


@app.route('/api/update_keywords')
def update_keywords():
  """
    persists the concept's keywords

    Parameters:
      domain -- the common name of the data under review
      concept_name -- the user given name of the concept

    Returns:
      closest_words -- these are displayed on the right panel of the concept screen
  """
  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'monty python')
  keywords = request.args.get('keywords', '')
  exec_database(user+'_'+domain,"Update concepts set keywords=? where concept_name=?",(keywords,concept_name))
  return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/update_shown_words')
def update_shown_words():
    user = request.args.get('user', 'testuser')
    domain = request.args.get('domain', 'movies')
    concept_name = request.args.get('concept_name', 'spy movies')
    shown_words = request.args.get('shown_words', 'a,b,c')
    exec_database(user+'_'+domain,"update concepts set shown_words=? where concept_name=?",(shown_words,concept_name))
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/api/label')
def label():
  from whoosh.qparser import QueryParser
  from whoosh import scoring
  from whoosh.index import open_dir
  import pickle
  import random
  text_list = list()
  feature_list = list()

  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'spy movies')
  topn = request.args.get('concept_name', 10)
  keywords = request.args.get('keywords', 'james bond,spy,MI6,007')

  ix = open_dir("./search/"+domain+"/indexdir")

  with ix.searcher(weighting=scoring.Frequency) as searcher:
      query = QueryParser("content", ix.schema).parse(keywords.replace(',',' OR '))
      results = searcher.search(query,limit=topn)
      for i in range(topn):
        text_list.append(results[i]['textdata'])

  feature_list = [get_features(text) for text in text_list]

  with open('./models/'+user+'_'+domain+'_'+concept_name+'_text_list.pkl', 'wb') as f:
    pickle.dump(text_list, f)
  with open('./models/'+user+'_'+domain+'_'+concept_name+'_feature_list.pkl', 'wb') as f:
    pickle.dump(feature_list, f)
  with open('./models/'+user+'_'+domain+'_'+concept_name+'_Y.pkl', 'wb') as f:
    pickle.dump([0 for _ in text_list], f)
  return json.dumps({'len_y':len(text_list)}), 200, {'ContentType':'application/json'} 

def get_features(clean_text):
  return np.mean(vectors.query(clean_text.split(' ')), axis=(0))
  
def find_nearest(array, value):
  """Finds the prediction closest to the boundary"""
  array = np.asarray(array)
  return (np.abs(array - value)).argmin()

@app.route('/api/train')
def train():
  from sklearn.linear_model import LogisticRegression
  import pickle
  import random
  import os.path
  user = request.args.get('user', 'testuser')
  domain = request.args.get('domain', 'movies')
  concept_name = request.args.get('concept_name', 'spy movies')

  # if actively training load our data
  actively_training = './models/'+user+'_'+domain+'_'+concept_name+'_Y.pkl'
  train_list = list()
  if os.path.isfile(actively_training):
    train_list = pickle.load(  open(actively_training, "rb" ) )
  text_list = pickle.load(  open('./models/'+user+'_'+domain+'_'+concept_name+'_text_list.pkl', "rb" ) )
  feature_list = pickle.load(  open('./models/'+user+'_'+domain+'_'+concept_name+'_feature_list.pkl', "rb" ) )
  Y = pickle.load(  open('./models/'+user+'_'+domain+'_'+concept_name+'_Y.pkl', "rb" ) )


  # if we have new information
  idx = request.args.get('idx', '')
  label = request.args.get('label', '')
  highlights = request.args.get('highlights', '')

  # add label, update feature vector, and persist
  if (len(highlights) > 0) :
    highlights = highlights.replace(',',' ').replace('  ',' ')
    idx = int(idx)
    label = int(label)
    train_list.append(idx)
    print('labeled example returned for sample id : ' + str(idx) + ' where TRUE is 1, this sample is ' + str(label) + ' and highlighted words are: ' + str(highlights) )
    Y[idx]= label
    feature_list[idx] = (get_features(highlights) * 0.9) + (1-0.9) * feature_list[idx]
    with open('./models/'+user+'_'+domain+'_'+concept_name+'_feature_list.pkl', 'wb') as f:
      pickle.dump(feature_list, f)
    with open('./models/'+user+'_'+domain+'_'+concept_name+'_Y.pkl', 'wb') as f:
      pickle.dump(Y, f)

  if len(train_list) > 0:
    print('training list is of length: ' + str(len(train_list)))
    # setup training data and model 
    x = [feature_list[i] for i in train_list]
    y = [Y[i] for i in train_list ]

    # we need at least one of each class
    if ('1' in y) and ('0' in y):
      model = LogisticRegression().fit( x, y )

      # find the index of the next most valuable sample to label
      not_selected = set(list(range(len(feature_list) )))-set(train_list)
      predictions = model.predict_proba([feature_list[i] for i in not_selected])[:,1]
      next_idx = find_nearest(predictions,0.5)
    else:
      not_selected = list(set(list(range(len(feature_list) )))-set(train_list))
      next_idx = random.choice(not_selected)
  else:
    next_idx = 0
  return json.dumps({'text':text_list[next_idx],'idx':next_idx}), 200, {'ContentType':'application/json'} 

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files['file']

    save_path = os.path.join(config.data_dir, secure_filename(file.filename))
    current_chunk = int(request.form['dzchunkindex'])

    # If the file already exists it's ok if we are appending to it,
    # but not if it's new file that would overwrite the existing one
    if os.path.exists(save_path) and current_chunk == 0:
        # 400 and 500s will tell dropzone that an error occurred and show an error
        return make_response(('File already exists', 400))

    try:
        with open(save_path, 'ab') as f:
            f.seek(int(request.form['dzchunkbyteoffset']))
            f.write(file.stream.read())
    except OSError:
        # log.exception will include the traceback so we can see what's wrong 
        log.exception('Could not write to file')
        return make_response(("Not sure why,"
                              " but we couldn't write the file to disk", 500))

    total_chunks = int(request.form['dztotalchunkcount'])

    if current_chunk + 1 == total_chunks:
        # This was the last chunk, the file should be complete and the size we expect
        if os.path.getsize(save_path) != int(request.form['dztotalfilesize']):
            log.error(f"File {file.filename} was completed, "
                      f"but has a size mismatch."
                      f"Was {os.path.getsize(save_path)} but we"
                      f" expected {request.form['dztotalfilesize']} ")
            return make_response(('Size mismatch', 500))
        else:
            log.info(f'File {file.filename} has been uploaded successfully')
    else:
        log.debug(f'Chunk {current_chunk + 1} of {total_chunks} '
                  f'for file {file.filename} complete')

    return make_response(("Chunk upload successful", 200))

@app.route('/api/get_data_domains')
def get_data_domains():
  """
    Gets the data domains available
    
  Returns:
    domain -- the common name of the data under review
  """
  return json.dumps([{ 'name': 'movies' }])


def main():
    tls1_2 = False
    if (tls1_2 == True):
      import ssl
      context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
      context.load_cert_chain('./server.crt','./server.key')
      app.run(host='localhost', port=3001, debug=False, ssl_context=context)
    else:
      app.run(host='localhost', port=3001, debug=False)

if __name__ == '__main__':
    main()


# pip install pymagnitude plotly lx4
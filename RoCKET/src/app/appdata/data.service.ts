import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {conditionallyCreateMapObjectLiteral} from '@angular/compiler/src/render3/view/util';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export class DataDomain {
  name: string;
}
export class LabelTask {
  constructor() {
    this.text = '';
    this.idx = '';
    this.highlights = '';
    this.label = 0;
  }
  text: string;
  idx: string;
  highlights: string;
  label: number;
}
export class Concept {
  name: string;
  description: string;
  shown_words: string;
}

@Injectable({
  providedIn: 'root'
})


export class DataService {
  concept: Concept;
  keywords: string;
  constructor(private http: HttpClient) { }
  submitTask(idx, label, highlights):Observable<LabelTask> {
    return this.http.get<LabelTask>('http://localhost:3001/api/train?idx='+idx+'&label='+label+'&highlights='+highlights);}

  getNextLabelTask():Observable<LabelTask> {
    return this.http.get<LabelTask>('http://localhost:3001/api/train');
  }

  getConcepts() {
      // console.log(this.http.get<Concept[]>('http://localhost:3001/api/get_concepts', httpOptions['header']).subscribe(data => console.log('Get from api',data)));
      return this.http.get('http://localhost:3001/api/get_concepts');
  }

  getDataDomains (): Observable<DataDomain[]> {
      return this.http.get<DataDomain[]>('http://localhost:3001/api/get_data_domains');
      //       //.pipe(
      //  catchError(this.handleError('getDataDomains', []))
      //);//of(DATADOMAINS);
  }
    // iron-tiger-start

    addConcept () {
        return this.http.get('http://localhost:3001/api/add_concept', {
            params: {
                domain: 'movies', concept_name: this.concept.name,
                concept_description: this.concept.description,
                keywords: 'web, UI, Python, c#',
                shown_words: 'a, b, c'
            }
        });
    }


    updateConcept () {
       return this.http.get('http://localhost:3001/api/update_concept', {
            params: {
                domain: 'movies',
                concept_name: this.concept.name,
                concept_description: this.concept.description,
                keywords: 'web, UI, Python, c#',
                shown_words: 'a, b, c'
            }
        });
    }

    deleteConcept () {
        return this.http.get('http://localhost:3001/api/delete_concept', {
            params: {
                domain: 'movies',
                concept_name: this.concept.name,
                concept_description: this.concept.description,
                keywords: 'web, UI, Python, c#',
                shown_words: 'a, b, c'
            }
        });
    }

    getKeywords () {
        return this.http.get('http://localhost:3001/api/get_keywords', {
            params: {
                domain: 'movies',
                concept_name: this.concept.name
            }
        });
    }

    updateKeywords () {
        return this.http.get('http://localhost:3001/api/update_keywords', {
            params: {
                domain: 'movies',
                concept_name: this.concept.name,
                keywords: this.keywords
            }
        });
    }
    getNearesKeywords () {
        return this.http.get('https://cbios.co:3001/api/get_nearest_words', {
            params: {
                keywords: this.keywords
            }
        });
    }

    updateShownwords () {
        return this.http.get('http://localhost:3001/api/update_shown_words', {
            params: {
                user: 'testuser',
                domain: 'movies',
                concept_name: this.concept.name,
                shown_words: this.concept.shown_words
            }
        });
    }

    //  iron-tiger-end
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
 
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
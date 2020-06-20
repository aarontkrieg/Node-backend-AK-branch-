const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { Pool, Client } = require("pg");
// const connectionString = "postgresql://stephen:stephen@localhost:5434/stephen";
const connectionString = "postgresql://stephen:stephen@192.168.1.10:5432/stephen";
// const d3 = require("d3");

//Get Author
router.get("/articles_by_journal_id", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Author");

  // Access the provided 'page' and 'limt' query parameters
  let journalID = req.query.journal_id;
  const pool = new Pool({
    connectionString: connectionString
  });


  let result = await pool.query(
    `SELECT * FROM sma 
    WHERE sma.journal_id='${journalID}'`
  );
  let articles = [];
  let links = [];
  let title = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);
    title.push(result.rows[i].title)

    let cites = await pool.query(
      `SELECT S.*
                  FROM sma S,
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C
                  WHERE S.id = C.cited_by_id limit 10`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links, title });
});

router.get("/get_article_by_id", async (req, res) => {
  // Data is retrieved from the json web token

  // Access the provided 'page' and 'limt' query parameters
  let id = req.query.article_id;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.id = '${id}'`
  );
  let title;
  let abstract;
  let published_date;
  let journal_id;

  for (var i = 0; i < result.rows.length; i++) {
    title = result.rows[i].title;
    abstract = result.rows[i].abstract;
    published_date = result.rows[i].publish_date;
    journal_id = result.rows[i].journal_id;
  }
  let journal = null;
  if (journal_id !== null) {
    let journalInfo = await pool.query(
      `SELECT J.name FROM journals J WHERE J.id = '${journal_id}'`
    );

    for (var i = 0; i < journalInfo.rows.length; i++) {
      journal = journalInfo.rows[i].name;
    }
  }

  let author = await pool.query(
    `SELECT A.author_name FROM article_authors A WHERE A.article_id = '${id}'`
  );

  authors = [];
  for (var i = 0; i < author.rows.length; i++) {
    let name = author.rows[i].author_name;
    authors.push(name);
  }

  let cited_by = await pool.query(
    `SELECT S.title
                FROM sma S,
                (SELECT C.* FROM cited_by C WHERE C.article_id = ${id}) C
                WHERE S.id = C.cited_by_id`
  );

  citations = [];
  for (var i = 0; i < cited_by.rows.length; i++) {
    const citation = cited_by.rows[i].title;
    citations.push(citation);
  }


  let cites = await pool.query(
    `SELECT S.title
                FROM sma S,
                (SELECT C.* FROM cites C WHERE C.article_id = ${id}) C
                WHERE S.id = C.cites_article_id`
  );

  references = [];
  for (var i = 0; i < cites.rows.length; i++) {
    const reference = cites.rows[i].title;
    references.push(reference);
  }

  let link = "http://google.com/search?q=" + title;


  // res.send({ title, abstract, authors, citations, references, date });
  citations.sort();
  references.sort();
  res.send({ id, title, abstract, authors, citations, references, published_date, journal, link });
});

router.get("/get_articles_by_journal", async (req, res) => {
  let JournalID = req.query.journal_id;
  console.log(req.query.area)
  const pool = new Pool({
    connectionString: connectionString
  });
  let result = await pool.query(
    `SELECT * FROM sma
    WHERE sma.journal_id='${JournalID}'`
  )
  let id = [];
  let title = [];
  let abstract = [];
  let authors = [];
  let citations = [];
  let references = [];
  let publish_date = [];
  let journal = [];
  let link = [];
  for (var i = 0; i < result.rows.length; i++) {
    id.push(results.rows[i].id)
    title.push(results.rows[i].title)
    abstract.push(results.rows[i].abstract)
    publish_date.push(results.rows[i].publish_date)
    id.push(results.rows[i].id)
    id.push(results.rows[i].id)
    id.push(results.rows[i].id)
    id.push(results.rows[i].id)
    id.push(results.rows[i].id)
  }
});

//Get articles within date
router.get("/get_date_range", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Date Range");

  // Access the provided 'page' and 'limt' query parameters
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.publish_date BETWEEN '${startDate}' and '${endDate}' limit 10`
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);

    let cites = await pool.query(
      // `SELECT S.* FROM sma S, (SELECT C.* FROM cites C WHERE C.article_id = ${article_id}) C WHERE S.id = C.cites_article_id`
      `SELECT S.*
                  FROM sma S,
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C
                  WHERE S.id = C.cited_by_id`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links });
});

//Get Articles by Keyword
router.get("/get_keyword", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Keyword");

  // Access the provided 'page' and 'limt' query parameters
  let keyword = req.query.keyword;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.abstract LIKE '%${keyword}%' limit 10`
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);

    let cites = await pool.query(
      // `SELECT S.* FROM sma S, (SELECT C.* FROM cites C WHERE C.article_id = ${article_id}) C WHERE S.id = C.cites_article_id`
      `SELECT S.*
                  FROM sma S,
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C
                  WHERE S.id = C.cited_by_id LIMIT 10`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links });
});

//Get categories from database
router.get("/get_subject_area", async (req, res) => {
  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT DISTINCT subject_area FROM journals`
  );
  // console.log(result)

  let areas = [];
  for (var i = 0; i < result.rows.length; i++) {
    areas.push(result.rows[i].subject_area);
  }
  // console.log("return results: " + areas)
  res.send(areas)
});

router.get("/get_subject_category", async (req, res) => {
  let area = req.query.area;
  console.log(req.query.area)
  const pool = new Pool({
    connectionString: connectionString
  });
  // console.log(area);
  // if (area == "others") {
  //   let result = await pool.query(
  //     `SELECT DISTINCT subject_category FROM journals
  //     WHERE journals.subject_area IS NULL`
  //   )
  // }
  // else {
    let result = await pool.query(
      `SELECT DISTINCT subject_category FROM journals 
      WHERE journals.subject_area='${area}'`
    )
  // }
  // console.log(result);
  let categories = [];
  for (var i = 0; i < result.rows.length; i++) {
    categories.push(result.rows[i].subject_category)
  }
  console.log("Category return results: " + categories)
  res.send(categories)
});

router.get("/get_journal", async (req, res) => {
  let category = req.query.category;
  console.log(req.query.category);
  const pool = new Pool({
    connectionString: connectionString
  });
  let result = await pool.query(
    `SELECT COUNT(sma.id) AS article_count, journals.* FROM journals 
    LEFT JOIN sma ON sma.journal_id = journals.id
          WHERE journals.subject_category='${category}'
    GROUP BY journals.id
    HAVING COUNT(sma.id) > 0
          ORDER BY article_count DESC`
  )
  let journalNames = [];
  let journalIDs = [];
  let articleCount = [];
  for (var i = 0; i < result.rows.length; i++) {
    journalNames.push(result.rows[i].name)
    journalIDs.push(result.rows[i].id)
    articleCount.push(result.rows[i].article_count)
  }

  res.send({ journalNames, journalIDs, articleCount })
});

router.get("/get_search", async (req, res) => {
  const pool = new Pool({
    connectionString: connectionString
  });
  console.log("search call request query", req.query);
  let keyword = req.query.keyword;
  let area = req.query.selected_sub_area;
  let category = req.query.selected_sub_category;
  let author = req.query.author;
  let result = await pool.query(
    `SELECT
    ts_rank_cd(search_vector, query, 16) AS rank,
    journals.id AS journal_id,
    journals.name AS journal,
    sma.id AS article_id,
    sma.title AS title
    FROM websearch_to_tsquery('${keyword}', '${author}') query, smav_search
    LEFT JOIN sma ON smav_search.sma_id = sma.id
    LEFT JOIN journals ON smav_search.journal_id = journals.id
    WHERE search_vector @@ query
    ORDER BY rank DESC`
  )

  let articles = [];
  let links = [];
  let title = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.article_id;

    articles.push(article_id);
    title.push(result.rows[i].title)

    let cites = await pool.query(
      `SELECT S.*
                  FROM sma S,
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C
                  WHERE S.id = C.cited_by_id limit 10`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  // let articles = [];
  // let links = [];
  // for (var i = 0; i < results.rows.length; i++) {
  //   articles.push(results.rows[i].article_id);
  // }

  res.send({ articles, links, title });
});
module.exports = router;

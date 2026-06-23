-- 002_seed.sql: Seed entities (owned + competitor watchlist) and starter prompts

-- ============================================================
-- OWNED ENTITIES
-- ============================================================
insert into entities (domain, brand_variants, ownership, type, label) values
(
  'loans.com.au',
  array['loans.com.au', 'loans com au', 'loans.com', 'Loans.com.au'],
  'owned', 'lender', 'loans.com.au'
),
(
  'savings.com.au',
  array['savings.com.au', 'savings com au', 'Savings.com.au', 'savings.com'],
  'owned', 'aggregator', 'Savings.com.au'
),
(
  'infochoice.com.au',
  array['infochoice.com.au', 'infochoice com au', 'InfoChoice', 'infochoice'],
  'owned', 'aggregator', 'InfoChoice'
);

-- ============================================================
-- COMPETITOR AGGREGATORS
-- ============================================================
insert into entities (domain, brand_variants, ownership, type, label) values
(
  'canstar.com.au',
  array['canstar.com.au', 'Canstar', 'canstar com au'],
  'competitor', 'aggregator', 'Canstar'
),
(
  'finder.com.au',
  array['finder.com.au', 'Finder', 'finder com au'],
  'competitor', 'aggregator', 'Finder'
),
(
  'ratecity.com.au',
  array['ratecity.com.au', 'RateCity', 'Rate City', 'ratecity com au'],
  'competitor', 'aggregator', 'RateCity'
),
(
  'mozo.com.au',
  array['mozo.com.au', 'Mozo', 'mozo com au'],
  'competitor', 'aggregator', 'Mozo'
),
(
  'comparethemarket.com.au',
  array['comparethemarket.com.au', 'Compare the Market', 'comparethemarket com au', 'CTM'],
  'competitor', 'aggregator', 'Compare the Market'
),
(
  'wemoney.com.au',
  array['wemoney.com.au', 'WeMoney', 'We Money', 'wemoney com au'],
  'competitor', 'aggregator', 'WeMoney'
),
(
  'iselect.com.au',
  array['iselect.com.au', 'iSelect', 'i Select', 'iselect com au'],
  'competitor', 'aggregator', 'iSelect'
);

-- ============================================================
-- COMPETITOR LENDERS — MAJOR BANKS
-- ============================================================
insert into entities (domain, brand_variants, ownership, type, label) values
(
  'commbank.com.au',
  array['commbank.com.au', 'CommBank', 'Commonwealth Bank', 'CBA', 'commbank com au'],
  'competitor', 'lender', 'CommBank'
),
(
  'westpac.com.au',
  array['westpac.com.au', 'Westpac', 'westpac com au'],
  'competitor', 'lender', 'Westpac'
),
(
  'nab.com.au',
  array['nab.com.au', 'NAB', 'National Australia Bank', 'nab com au'],
  'competitor', 'lender', 'NAB'
),
(
  'anz.com.au',
  array['anz.com.au', 'ANZ', 'Australia and New Zealand Banking', 'anz com au'],
  'competitor', 'lender', 'ANZ'
),
(
  'macquarie.com.au',
  array['macquarie.com.au', 'Macquarie', 'Macquarie Bank', 'macquarie com au'],
  'competitor', 'lender', 'Macquarie'
),
(
  'ing.com.au',
  array['ing.com.au', 'ING', 'ING Australia', 'ing com au'],
  'competitor', 'lender', 'ING'
),
(
  'ubank.com.au',
  array['ubank.com.au', 'ubank', 'UBank', 'ubank com au'],
  'competitor', 'lender', 'ubank'
),
(
  'bankwest.com.au',
  array['bankwest.com.au', 'Bankwest', 'Bank West', 'bankwest com au'],
  'competitor', 'lender', 'Bankwest'
),
(
  'stgeorge.com.au',
  array['stgeorge.com.au', 'St.George', 'St George', 'Saint George', 'stgeorge com au'],
  'competitor', 'lender', 'St.George'
),
(
  'suncorp.com.au',
  array['suncorp.com.au', 'Suncorp', 'Suncorp Bank', 'suncorp com au'],
  'competitor', 'lender', 'Suncorp'
);

-- ============================================================
-- COMPETITOR LENDERS — NON-BANKS / FINTECHS
-- ============================================================
insert into entities (domain, brand_variants, ownership, type, label) values
(
  'athena.com.au',
  array['athena.com.au', 'Athena', 'Athena Home Loans', 'athena com au'],
  'competitor', 'lender', 'Athena'
),
(
  'unloan.com.au',
  array['unloan.com.au', 'Unloan', 'unloan com au'],
  'competitor', 'lender', 'Unloan'
),
(
  'tictoc.com.au',
  array['tictoc.com.au', 'Tic:Toc', 'TicToc', 'Tic Toc', 'tictoc com au'],
  'competitor', 'lender', 'Tic:Toc'
),
(
  'aussie.com.au',
  array['aussie.com.au', 'Aussie', 'Aussie Home Loans', 'aussie com au'],
  'competitor', 'lender', 'Aussie'
),
(
  'pepper.com.au',
  array['pepper.com.au', 'Pepper Money', 'Pepper', 'pepper com au'],
  'competitor', 'lender', 'Pepper Money'
),
(
  'liberty.com.au',
  array['liberty.com.au', 'Liberty', 'Liberty Financial', 'liberty com au'],
  'competitor', 'lender', 'Liberty'
),
(
  'latrobefinancial.com.au',
  array['latrobefinancial.com.au', 'La Trobe Financial', 'La Trobe', 'LaTrobe', 'latrobefinancial com au'],
  'competitor', 'lender', 'La Trobe Financial'
),
(
  'thinktank.net.au',
  array['thinktank.net.au', 'Thinktank', 'Think Tank', 'thinktank net au'],
  'competitor', 'lender', 'Thinktank'
);

-- ============================================================
-- COMPETITOR LENDERS — CAR LOAN SPECIFIC
-- ============================================================
insert into entities (domain, brand_variants, ownership, type, label) values
(
  'strattonfinance.com.au',
  array['strattonfinance.com.au', 'Stratton Finance', 'Stratton', 'strattonfinance com au'],
  'competitor', 'lender', 'Stratton Finance'
),
(
  'plenti.com.au',
  array['plenti.com.au', 'Plenti', 'plenti com au'],
  'competitor', 'lender', 'Plenti'
),
(
  'wisr.com.au',
  array['wisr.com.au', 'Wisr', 'wisr com au'],
  'competitor', 'lender', 'Wisr'
),
(
  'money3.com.au',
  array['money3.com.au', 'Money3', 'money3 com au'],
  'competitor', 'lender', 'Money3'
);

-- ============================================================
-- STARTER PROMPTS
-- ============================================================
insert into prompts (text, vertical, tags) values
  ('What are the best home loan rates in Australia right now?', 'home_loans', array['rates', 'comparison']),
  ('Which Australian lender offers the lowest variable home loan rate?', 'home_loans', array['variable', 'rates']),
  ('What is the best home loan for first home buyers in Australia?', 'home_loans', array['first_home_buyer']),
  ('How do I compare home loans in Australia?', 'home_loans', array['comparison', 'how_to']),
  ('What are the best offset account home loans in Australia?', 'home_loans', array['offset', 'features']),
  ('Which banks have the best home loan rates in Australia?', 'home_loans', array['banks', 'rates']),
  ('What are the best car loan rates in Australia?', 'car_loans', array['rates', 'comparison']),
  ('How do I get a car loan in Australia with bad credit?', 'car_loans', array['bad_credit']),
  ('What are the best personal loan rates for a car in Australia?', 'car_loans', array['personal_loan']),
  ('What credit score do I need for a car loan in Australia?', 'car_loans', array['credit_score', 'eligibility']),
  ('Which Australian lender offers the lowest car loan interest rate?', 'car_loans', array['rates', 'comparison']),
  ('What is the best way to finance a used car in Australia?', 'car_loans', array['used_car', 'comparison']),
  ('Can I get a car loan with no deposit in Australia?', 'car_loans', array['no_deposit', 'eligibility']);

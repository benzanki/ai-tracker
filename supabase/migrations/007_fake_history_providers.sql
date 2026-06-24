-- 007_fake_history_providers.sql
-- Adds 7 days of fake run data for chatgpt, gemini, and perplexity.
-- Each provider has slightly different citation tendencies to make
-- the provider share chart meaningful.

do $$
declare
  v_run_id uuid;
  v_response_id uuid;
  v_prompt record;
  v_day int;
  v_run_date timestamptz;
  v_provider text;

  id_loans uuid;
  id_savings uuid;
  id_infochoice uuid;
  id_canstar uuid;
  id_finder uuid;
  id_ratecity uuid;
  id_mozo uuid;
  id_commbank uuid;
  id_westpac uuid;
  id_nab uuid;
  id_anz uuid;
  id_athena uuid;
  id_unloan uuid;

begin
  select id into id_loans      from entities where domain = 'loans.com.au';
  select id into id_savings    from entities where domain = 'savings.com.au';
  select id into id_infochoice from entities where domain = 'infochoice.com.au';
  select id into id_canstar    from entities where domain = 'canstar.com.au';
  select id into id_finder     from entities where domain = 'finder.com.au';
  select id into id_ratecity   from entities where domain = 'ratecity.com.au';
  select id into id_mozo       from entities where domain = 'mozo.com.au';
  select id into id_commbank   from entities where domain = 'commbank.com.au';
  select id into id_westpac    from entities where domain = 'westpac.com.au';
  select id into id_nab        from entities where domain = 'nab.com.au';
  select id into id_anz        from entities where domain = 'anz.com.au';
  select id into id_athena     from entities where domain = 'athena.com.au';
  select id into id_unloan     from entities where domain = 'unloan.com.au';

  foreach v_provider in array array['chatgpt', 'gemini', 'perplexity'] loop
    for v_day in 1..7 loop
      -- Stagger run times so they don't collide
      v_run_date := (current_date - v_day) + case v_provider
        when 'chatgpt'    then time '03:00:00'
        when 'gemini'     then time '04:00:00'
        when 'perplexity' then time '05:00:00'
      end;

      insert into runs (started_at, finished_at, status, provider)
      values (v_run_date, v_run_date + interval '8 minutes', 'complete', v_provider)
      returning id into v_run_id;

      for v_prompt in select id, text, vertical from prompts where active = true loop

        insert into responses (run_id, prompt_id, provider, model, answer_text, created_at)
        values (
          v_run_id,
          v_prompt.id,
          v_provider,
          case v_provider
            when 'chatgpt'    then 'gpt-4o'
            when 'gemini'     then 'gemini-2.0-flash'
            when 'perplexity' then 'sonar-pro'
          end,
          'Simulated ' || v_provider || ' answer for: ' || v_prompt.text,
          v_run_date + (random() * interval '7 minutes')
        )
        returning id into v_response_id;

        -- ── HOME LOANS ──────────────────────────────────────────────────────
        if v_prompt.vertical = 'home_loans' then

          -- ChatGPT: heavy on big banks, moderate aggregators
          if v_provider = 'chatgpt' then
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,    'https://www.canstar.com.au/home-loans/',     'canstar.com.au',    1, true);  end if;
            if random() > 0.35 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,     'https://www.finder.com.au/home-loans',      'finder.com.au',     2, true);  end if;
            if random() > 0.3  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank,   'https://www.commbank.com.au/home-loans.html','commbank.com.au',  3, false); end if;
            if random() > 0.35 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_westpac,    'https://www.westpac.com.au/home-buying/',   'westpac.com.au',    4, false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_nab,        'https://www.nab.com.au/home-loans',         'nab.com.au',        5, false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_anz,        'https://www.anz.com.au/home-loans/',        'anz.com.au',        6, false); end if;
            if random() > 0.55 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_ratecity,   'https://www.ratecity.com.au/home-loans',    'ratecity.com.au',   7, false); end if;
            if random() > 0.45 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/home-loans/', 'infochoice.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.55 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/home-loans/', 'savings.com.au', 9, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, true, true);
            end if;
            if random() > 0.8 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/home-loans', 'loans.com.au', 10, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            end if;

          -- Gemini: strong aggregator bias, occasionally mentions owned sites in text
          elsif v_provider = 'gemini' then
            if random() > 0.1  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,  'https://www.canstar.com.au/home-loans/',     'canstar.com.au',   1, true);  end if;
            if random() > 0.15 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/home-loans',    'ratecity.com.au',  2, true);  end if;
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,   'https://www.finder.com.au/home-loans',      'finder.com.au',    3, true);  end if;
            if random() > 0.25 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_mozo,     'https://mozo.com.au/home-loans',            'mozo.com.au',      4, false); end if;
            if random() > 0.45 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank, 'https://www.commbank.com.au/home-loans.html','commbank.com.au',  5, false); end if;
            if random() > 0.5  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_athena,   'https://www.athena.com.au/home-loans',      'athena.com.au',    6, false); end if;
            if random() > 0.4  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/home-loans/', 'infochoice.com.au', 7, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.5  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/home-loans/', 'savings.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, true, true);
            end if;
            if random() > 0.7  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/home-loans', 'loans.com.au', 9, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            elsif random() > 0.45 then
              insert into entity_mentions(response_id, entity_id, linked, cited_separately) values (v_response_id, id_loans, false, false);
            end if;

          -- Perplexity: most citations overall, loves aggregators AND non-banks
          elsif v_provider = 'perplexity' then
            if random() > 0.1  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,  'https://www.canstar.com.au/home-loans/',     'canstar.com.au',   1, true);  end if;
            if random() > 0.15 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,   'https://www.finder.com.au/home-loans',      'finder.com.au',    2, true);  end if;
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/home-loans',    'ratecity.com.au',  3, true);  end if;
            if random() > 0.25 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_mozo,     'https://mozo.com.au/home-loans',            'mozo.com.au',      4, true);  end if;
            if random() > 0.35 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_athena,   'https://www.athena.com.au/home-loans',      'athena.com.au',    5, false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_unloan,   'https://www.unloan.com.au/',                'unloan.com.au',    6, false); end if;
            if random() > 0.45 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank, 'https://www.commbank.com.au/home-loans.html','commbank.com.au',  7, false); end if;
            -- Perplexity cites owned sites more readily
            if random() > 0.3  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/home-loans/', 'infochoice.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.35 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/home-loans/', 'savings.com.au', 9, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, true, true);
            end if;
            if random() > 0.6  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/home-loans', 'loans.com.au', 10, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            end if;
          end if;

        -- ── CAR LOANS ───────────────────────────────────────────────────────
        else

          if v_provider = 'chatgpt' then
            if random() > 0.25 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,  'https://www.canstar.com.au/car-loans/', 'canstar.com.au',  1, true);  end if;
            if random() > 0.3  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,   'https://www.finder.com.au/car-loans',  'finder.com.au',   2, true);  end if;
            if random() > 0.35 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank, 'https://www.commbank.com.au/car-loans.html','commbank.com.au',3,false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_nab,      'https://www.nab.com.au/personal/loans/car-loan','nab.com.au',4,false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_anz,      'https://www.anz.com.au/personal/personal-loans/car-loan/','anz.com.au',5,false); end if;
            if random() > 0.55 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/car-loans/', 'infochoice.com.au', 6, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.65 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/car-loans/', 'savings.com.au', 7, false);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, false, true);
            end if;
            if random() > 0.88 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/car-loans', 'loans.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            end if;

          elsif v_provider = 'gemini' then
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,  'https://www.canstar.com.au/car-loans/', 'canstar.com.au',  1, true);  end if;
            if random() > 0.25 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/car-loans','ratecity.com.au', 2, true);  end if;
            if random() > 0.3  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,   'https://www.finder.com.au/car-loans',  'finder.com.au',   3, true);  end if;
            if random() > 0.45 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank, 'https://www.commbank.com.au/car-loans.html','commbank.com.au',4,false); end if;
            if random() > 0.5  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_nab,      'https://www.nab.com.au/personal/loans/car-loan','nab.com.au',5,false); end if;
            if random() > 0.5  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/car-loans/', 'infochoice.com.au', 6, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.6  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/car-loans/', 'savings.com.au', 7, false);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, false, true);
            end if;
            if random() > 0.85 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/car-loans', 'loans.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            end if;

          elsif v_provider = 'perplexity' then
            if random() > 0.15 then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_canstar,  'https://www.canstar.com.au/car-loans/', 'canstar.com.au',  1, true);  end if;
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_finder,   'https://www.finder.com.au/car-loans',  'finder.com.au',   2, true);  end if;
            if random() > 0.2  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/car-loans','ratecity.com.au', 3, true);  end if;
            if random() > 0.3  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_mozo,     'https://mozo.com.au/car-loans',        'mozo.com.au',     4, true);  end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_commbank, 'https://www.commbank.com.au/car-loans.html','commbank.com.au',5,false); end if;
            if random() > 0.4  then insert into citations (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_nab,      'https://www.nab.com.au/personal/loans/car-loan','nab.com.au',6,false); end if;
            if random() > 0.4  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/car-loans/', 'infochoice.com.au', 7, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_infochoice, true, true);
            end if;
            if random() > 0.45 then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_savings, 'https://www.savings.com.au/car-loans/', 'savings.com.au', 8, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_savings, true, true);
            end if;
            if random() > 0.7  then
              insert into citations      (response_id, entity_id, url, domain, position, in_body) values (v_response_id, id_loans, 'https://www.loans.com.au/car-loans', 'loans.com.au', 9, true);
              insert into entity_mentions(response_id, entity_id, linked, cited_separately)       values (v_response_id, id_loans, true, true);
            end if;
          end if;

        end if;
      end loop;
    end loop;
  end loop;
end $$;

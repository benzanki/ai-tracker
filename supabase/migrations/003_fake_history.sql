-- 003_fake_history.sql
-- Generates 7 days of fake run data for dashboard development.
-- Safe to run multiple times — uses a transaction so it's all-or-nothing.
-- DELETE FROM runs WHERE provider = 'claude' AND started_at < now() - interval '1 day'
-- to wipe fake data once real runs accumulate.

do $$
declare
  v_run_id uuid;
  v_response_id uuid;
  v_prompt record;
  v_entity record;
  v_day int;
  v_run_date timestamptz;
  v_position int;

  -- Owned entity IDs
  id_loans uuid;
  id_savings uuid;
  id_infochoice uuid;

  -- Competitor IDs (subset most likely to appear)
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
  select id into id_loans from entities where domain = 'loans.com.au';
  select id into id_savings from entities where domain = 'savings.com.au';
  select id into id_infochoice from entities where domain = 'infochoice.com.au';
  select id into id_canstar from entities where domain = 'canstar.com.au';
  select id into id_finder from entities where domain = 'finder.com.au';
  select id into id_ratecity from entities where domain = 'ratecity.com.au';
  select id into id_mozo from entities where domain = 'mozo.com.au';
  select id into id_commbank from entities where domain = 'commbank.com.au';
  select id into id_westpac from entities where domain = 'westpac.com.au';
  select id into id_nab from entities where domain = 'nab.com.au';
  select id into id_anz from entities where domain = 'anz.com.au';
  select id into id_athena from entities where domain = 'athena.com.au';
  select id into id_unloan from entities where domain = 'unloan.com.au';

  -- 7 days ago through yesterday
  for v_day in 1..7 loop
    v_run_date := (current_date - v_day) + time '02:00:00';

    insert into runs (started_at, finished_at, status, provider)
    values (v_run_date, v_run_date + interval '8 minutes', 'complete', 'claude')
    returning id into v_run_id;

    -- Loop over all active prompts
    for v_prompt in select id, text, vertical from prompts where active = true loop

      insert into responses (run_id, prompt_id, provider, model, answer_text, created_at)
      values (
        v_run_id,
        v_prompt.id,
        'claude',
        'claude-sonnet-4-6',
        'This is a simulated answer for: ' || v_prompt.text,
        v_run_date + (random() * interval '7 minutes')
      )
      returning id into v_response_id;

      -- Citation patterns vary by vertical and prompt type
      if v_prompt.vertical = 'home_loans' then

        -- Aggregators almost always appear in home loan comparisons
        if random() > 0.15 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_canstar, 'https://www.canstar.com.au/home-loans/', 'canstar.com.au', 1, true);
        end if;

        if random() > 0.25 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_finder, 'https://www.finder.com.au/home-loans', 'finder.com.au', 2, true);
        end if;

        if random() > 0.3 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/home-loans', 'ratecity.com.au', 3, false);
        end if;

        if random() > 0.4 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_mozo, 'https://mozo.com.au/home-loans', 'mozo.com.au', 4, false);
        end if;

        -- Big banks appear moderately
        if random() > 0.5 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_commbank, 'https://www.commbank.com.au/home-loans.html', 'commbank.com.au', 5, false);
        end if;

        if random() > 0.6 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_westpac, 'https://www.westpac.com.au/home-buying/', 'westpac.com.au', 6, false);
        end if;

        -- Non-banks appear occasionally
        if random() > 0.65 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_athena, 'https://www.athena.com.au/home-loans', 'athena.com.au', 7, false);
        end if;

        if random() > 0.7 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_unloan, 'https://www.unloan.com.au/', 'unloan.com.au', 8, false);
        end if;

        -- Owned sites: savings and infochoice appear reasonably, loans.com.au rarely
        if random() > 0.35 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/home-loans/', 'infochoice.com.au', 9, true);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_infochoice, true, true);
        end if;

        if random() > 0.45 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_savings, 'https://www.savings.com.au/home-loans/', 'savings.com.au', 10, true);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_savings, true, true);
        end if;

        -- loans.com.au: appears ~25% of the time, more on brand/non-bank prompts
        if random() > 0.75 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_loans, 'https://www.loans.com.au/home-loans', 'loans.com.au', 11, true);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_loans, true, true);
        elsif random() > 0.5 then
          -- mentioned in prose but not cited
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_loans, false, false);
        end if;

      else -- car_loans

        -- Aggregators still dominate car loan comparisons
        if random() > 0.2 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_canstar, 'https://www.canstar.com.au/car-loans/', 'canstar.com.au', 1, true);
        end if;

        if random() > 0.3 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_finder, 'https://www.finder.com.au/car-loans', 'finder.com.au', 2, true);
        end if;

        if random() > 0.4 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_ratecity, 'https://www.ratecity.com.au/car-loans', 'ratecity.com.au', 3, false);
        end if;

        -- Banks appear for car loans too
        if random() > 0.55 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_commbank, 'https://www.commbank.com.au/car-loans.html', 'commbank.com.au', 4, false);
        end if;

        if random() > 0.6 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_nab, 'https://www.nab.com.au/personal/loans/car-loan', 'nab.com.au', 5, false);
        end if;

        if random() > 0.6 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_anz, 'https://www.anz.com.au/personal/personal-loans/car-loan/', 'anz.com.au', 6, false);
        end if;

        -- Owned sites appear less in car loans
        if random() > 0.5 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_infochoice, 'https://www.infochoice.com.au/car-loans/', 'infochoice.com.au', 7, true);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_infochoice, true, true);
        end if;

        if random() > 0.6 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_savings, 'https://www.savings.com.au/car-loans/', 'savings.com.au', 8, false);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_savings, false, true);
        end if;

        if random() > 0.85 then
          insert into citations (response_id, entity_id, url, domain, position, in_body)
          values (v_response_id, id_loans, 'https://www.loans.com.au/car-loans', 'loans.com.au', 9, true);
          insert into entity_mentions (response_id, entity_id, linked, cited_separately)
          values (v_response_id, id_loans, true, true);
        end if;

      end if;

    end loop;
  end loop;
end $$;

<conversation_summary>

<decisions>

1. Persona: użytkownicy z Polski zaczynający naukę języka angielskiego.
2. Kierunek tłumaczeń: zawsze z angielskiego na polski; dodawanie odbywa się w dialogu po kliknięciu przycisku „Dodaj”.
3. Zakres wejścia: obsługujemy słowa i kolokacje; akceptujemy dowolne znaki, zachowujemy oryginalną pisownię.
4. Model karty: minimalnie `słowo` + `tłumaczenie`.
5. Edycja: można edytować oba pola w dialogu; zapisywany jest `updatedAt`.
6. AI flow: „Generuj” → propozycja tłumaczenia → użytkownik może edytować → dodanie; akceptacja = dodanie karty po wygenerowaniu (z lub bez edycji).
7. Regeneracja: dozwolona bez limitów.
8. Lista: sortowanie malejąco po dacie dodania; paginacja z wyborem 10/50/100; edycja w dialogu; twarde usuwanie z potwierdzeniem w modalnym oknie; brak wyszukiwarki.
9. Uwierzytelnianie: e‑mail + hasło; bez SSO, bez potwierdzania e‑mail; bez resetu hasła; polityka hasła min. 8 znaków i 1 cyfra; długie sesje z automatycznym odświeżaniem.
10. Mobile-first: nacisk na czytelność i ergonomię na małych ekranach; bez PWA/offline na teraz.
11. Na razie ignorujemy kwestie limitów kosztów/RODO.

</decisions>

<matched_recommendations>

1. Ujednolicenie UI dialogu dodawania: pola „Angielskie słowo/kolokacja” i „Polskie tłumaczenie”, z jasnym krokiem „Generuj” → „Edytuj” → „Dodaj”.
2. Edytowalność obu pól i zapisywanie `updatedAt` przy każdej zmianie.
3. Potwierdzenie przy twardym usuwaniu w modalu; brak „Cofnij”.
4. Instrumentacja zdarzeń analitycznych do mierzenia akceptacji (np. `generate_clicked`, `translate_generated`, `card_added_after_generate`, `edit_saved`, `delete_confirmed`).
5. Paginacja listy z wyborem rozmiaru strony (10/50/100) i domyślnym sortowaniem po `createdAt` malejąco.
6. Długie sesje z automatycznym odświeżaniem oraz podstawowa polityka siły haseł.
7. Regeneracja dostępna z poziomu dialogu („Przegeneruj”); bez limitów funkcjonalnych — rekomendowane lekkie odciążenie UI (np. debounce, stan ładowania).

</matched_recommendations>

<prd_planning_summary>

- Główne wymagania funkcjonalne:
  - Dodawanie karty: w dialogu wprowadzane jest angielskie słowo/kolokacja, klik „Generuj” daje polskie tłumaczenie, użytkownik może edytować oba pola i dodać kartę;
  - Regeneracja tłumaczenia: dostępna bez limitów, aż do akceptacji lub zamknięcia dialogu.
  - Przeglądanie/zarządzanie: lista kart posortowana po dacie dodania malejąco, paginacja 10/50/100, edycja w dialogu, twarde usuwanie po potwierdzeniu.
  - Uwierzytelnianie: e‑mail + hasło (min. 8 znaków, 1 cyfra), bez SSO, bez weryfikacji e‑mail i bez resetu hasła; długie sesje z auto‑odświeżaniem.
  - Mobile-first: layout i komponenty zoptymalizowane pod małe ekrany (czytelna typografia, duże hit‑targety, proste przepływy).

- Kluczowe historie użytkownika i ścieżki:
  1) Jako początkujący użytkownik klikam „Dodaj”, wpisuję angielskie słowo/kolokację, klikam „Generuj”, ewentualnie edytuję, a następnie zapisuję kartę.
  2) Jako użytkownik przeglądam listę moich kart, nawiguję paginacją (10/50/100), otwieram dialog edycji wybranej karty, aktualizuję i zapisuję.
  3) Jako użytkownik usuwam kartę, potwierdzam w modalnym oknie i wpis znika z listy.
  4) Jako użytkownik loguję się/zarejes­trowuję przez e‑mail i hasło; pozostaję zalogowany dzięki długiej sesji.

- Kryteria sukcesu i pomiar:
  - Cel: 75% akceptacji tłumaczeń AI.
  - Definicja akceptacji: „Dodano kartę po wygenerowaniu (z lub bez edycji)”.
  - Pomiar: instrumentacja zdarzeń (min. `generate_clicked`, `translate_generated`, `card_added_after_generate`). Wymagane ustalenie okna czasowego i mianownika (patrz kwestie otwarte).

- Dodatkowe założenia niefunkcjonalne:
  - Responsywność i dostępność na urządzeniach mobilnych.
  - Minimalistyczna telemetria pod metrykę akceptacji.
  - Brak ograniczeń kosztowych/RODO na etapie MVP (świadoma decyzja).

</prd_planning_summary>

<unresolved_issues>

1. Metryka 75%: brak zdefiniowanego mianownika (np. wszystkie sesje z „Generuj” vs. tylko zakończone) oraz okna czasowego (np. 30 dni) i minimalnej próbki. odpowiedz -> te zaakceptowane i Anulowane są wazne
2. Czy dopuszczamy dodanie karty bez użycia AI (w pełni ręczne) w dialogu, czy „Dodaj” powinien być dostępny dopiero po „Generuj”? odpowiedz -> tak dopuszczamy bez uzycia AI
3. Domyślny rozmiar strony w paginacji (10/50/100) — który wariant ustawiamy jako standard? odpowiedz -> domyślny to 10
4. Telemetria: wybór narzędzia (np. własne logi vs. usługa analityczna) oraz zakres przechowywania zdarzeń. odpowiedz -> wlasne logi
5. Ograniczenia UX dla „bez limitów” regeneracji: czy wprowadzamy choć minimalny debounce/anty‑spam, by chronić UX i infrastrukturę? odpowiedz -> nie wprowadzamy
6. Język interfejsu i i18n: czy interfejs jest wyłącznie po polsku w MVP? odpowiedz -> tak tylko po polsku
7. Standardy dostępności (np. kontrast, focus states) — czy wchodzą do kryteriów akceptacyjnych? odpowiedz -> nie

</unresolved_issues>

</conversation_summary>
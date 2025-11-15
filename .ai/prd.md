# Dokument wymagań produktu (PRD) - MemoWords

## 1. Przegląd produktu

MemoWords to webowa aplikacja do nauki słownictwa, której celem jest przyspieszenie i uproszczenie budowania własnej listy słów angielskich z polskimi tłumaczeniami. Aplikacja pozwala dodawać karty ze słowami lub kolokacjami, generować tłumaczenia przez AI, edytować i usuwać karty oraz zarządzać listą z poziomu jednego interfejsu. Użytkownik tworzy konto (e‑mail + hasło) i utrzymuje własną, prywatną kolekcję kart.

Najważniejsze założenia:
- Persona: użytkownicy z Polski zaczynający naukę języka angielskiego.
- Kierunek tłumaczeń: zawsze z angielskiego na polski.
- Interfejs użytkownika: tylko w języku polskim (MVP).
- Mobile‑first: nacisk na czytelność i ergonomię na małych ekranach.
- Prosty, szybki przepływ dodawania: Dodaj → Generuj → Edytuj → Zapisz (z możliwością dodania całkowicie ręcznego, bez AI).

Zakres MVP w skrócie:
- Dodawanie kart ze słowem/kolokacją i tłumaczeniem (AI lub ręczne).
- Przeglądanie listy, edycja i twarde usuwanie z potwierdzeniem.
- Uwierzytelnianie: e‑mail + hasło, długie sesje z auto‑odświeżaniem.
- Deduplikacja wpisów 1:1, sortowanie listy malejąco po dacie dodania, paginacja 10/50/100.
- Telemetria w logach własnych na potrzeby metryki akceptacji tłumaczeń AI.


## 2. Problem użytkownika

Manualne przygotowanie list słów do nauki jest czasochłonne i zniechęcające. Brakuje szybkiej pomocy w pozyskaniu poprawnego tłumaczenia, a powtarzalne, ręczne czynności (kopiowanie, weryfikacja, formatowanie) zwiększają tarcie i podatność na błędy. Użytkownicy często rezygnują, gdy proces nie jest natychmiastowy, spójny i prosty na urządzeniach mobilnych.


## 3. Wymagania funkcjonalne

- Uwierzytelnianie i sesje:
  - Rejestracja i logowanie przez e‑mail + hasło.
  - Polityka hasła: minimum 8 znaków i co najmniej 1 cyfra.
  - Brak SSO, brak weryfikacji e‑mail, brak resetu hasła (MVP).
  - Długie sesje z automatycznym odświeżaniem; możliwość wylogowania.
  - Backend weryfikuje JWT z Supabase JWK; backend nie przechowuje haseł.

- Model danych karty:
  - Minimalne pola: słowo/kolokacja (oryginał), tłumaczenie, createdAt, updatedAt.
  - Przechowywanie oryginalnej pisowni wejścia; operacje (np. duplikaty) oparte na wersji znormalizowanej.

- Dodawanie karty:
  - Dialog dodawania zawiera pola: Angielskie słowo/kolokacja oraz Polskie tłumaczenie.
  - Tryb AI: przycisk Generuj tworzy propozycję tłumaczenia; użytkownik może edytować oba pola i dodać kartę.
  - Tryb ręczny: możliwe dodanie bez użycia AI (użytkownik sam wypełnia oba pola).
  - Regeneracja tłumaczenia dostępna bez limitów.
  - Blokada duplikatów 1:1 (jedno słowo/kolokacja → jedno tłumaczenie) w oparciu o normalizację: trim, lowercase, pojedyncze spacje; brak oferty przejścia do edycji istniejącej karty, wyłącznie komunikat.

- Edycja i usuwanie:
  - Edycja karty w dialogu; aktualizacja obu pól dozwolona; zapisywany updatedAt.
  - Twarde usuwanie po potwierdzeniu w modalnym oknie; brak cofania.

- Lista i paginacja:
  - Domyślne sortowanie malejąco po createdAt.
  - Paginacja z wyborem rozmiaru strony: 10 (domyślnie), 50, 100.
  - Brak wyszukiwarki w MVP.
  - Widok przy pustej liście informuje o braku kart i sugeruje dodanie pierwszej.

- Generowanie AI i UX:
  - Brak limitów funkcjonalnych liczby regeneracji (MVP).
  - Wskazane są stany ładowania; brak dodatkowych ograniczeń anty‑spam.

- Telemetria i pomiar:
  - Własne logi jako źródło danych.
  - Minimalny zestaw zdarzeń: generate_clicked, translate_generated, card_added_after_generate, edit_saved, delete_confirmed, dialog_add_canceled.

- Język i dostępność:
  - Interfejs tylko po polsku w MVP.
  - Standardy dostępności nie są kryterium akceptacyjnym w MVP.

- Błędy i komunikaty:
  - Jasne komunikaty błędów dla: duplikatu, braku autoryzacji, błędów sieci/AI, nieprawidłowego hasła.
  - Zachowanie formularza przy błędach: wartości pól pozostają zachowane, możliwość ponowienia.


## 4. Granice produktu

- Poza zakresem MVP:
  - Tworzenie batchowe kart.
  - Współdzielenie zestawów kart między użytkownikami.
  - Integracje z innymi platformami edukacyjnymi.
  - Aplikacje mobilne natywne i PWA/offline.
  - SSO, weryfikacja e‑mail, reset hasła.
  - Wyszukiwarka i zaawansowane filtrowanie.

- Ograniczenia i założenia:
  - Regeneracja tłumaczeń bez limitów funkcjonalnych.
  - Telemetria w logach własnych; minimalny zakres pod metrykę akceptacji.
  - Język interfejsu: wyłącznie polski.
  - RODO/koszty chmurowe pominięte na etapie MVP.


## 5. Historyjki użytkowników

US-001
- Tytuł: Rejestracja konta e‑mail + hasło
- Opis: Jako nowy użytkownik chcę zarejestrować konto, aby móc tworzyć własną listę kart.
- Kryteria akceptacji:
  - Mogę podać e‑mail i hasło spełniające wymagania (min. 8 znaków, 1 cyfra).
  - Przy hasłach niespełniających wymagań dostaję czytelny komunikat.
  - Po sukcesie jestem zalogowany i widzę pustą listę kart lub istniejące karty.
  - Nie ma weryfikacji e‑mail ani resetu hasła.

US-002
- Tytuł: Logowanie do konta
- Opis: Jako istniejący użytkownik chcę się zalogować, aby uzyskać dostęp do moich kart.
- Kryteria akceptacji:
  - Poprawny e‑mail/hasło loguje i przenosi do listy kart.
  - Błędne dane zwracają komunikat o błędzie bez ujawniania szczegółów bezpieczeństwa.

US-003
- Tytuł: Długie sesje z automatycznym odświeżaniem
- Opis: Jako zalogowany użytkownik chcę pozostać zalogowany bez konieczności częstego logowania.
- Kryteria akceptacji:
  - Sesja jest odświeżana automatycznie przed wygaśnięciem.
  - Po wygaśnięciu i nieudanym odświeżeniu następuje bezpieczne wylogowanie.

US-004
- Tytuł: Wylogowanie
- Opis: Jako użytkownik chcę się wylogować, aby zakończyć pracę na tym urządzeniu.
- Kryteria akceptacji:
  - Wybranie wylogowania usuwa stan sesji i wymaga ponownego logowania do dalszych akcji.

US-005
- Tytuł: Przeglądanie listy kart
- Opis: Jako użytkownik chcę widzieć moje karty posortowane od najnowszej.
- Kryteria akceptacji:
  - Lista sortuje się malejąco po createdAt.
  - Pusty stan informuje o braku kart i możliwości dodania pierwszej.
  - Widzę numery stron i mogę między nimi przechodzić.

US-006
- Tytuł: Zmiana rozmiaru strony listy
- Opis: Jako użytkownik chcę móc wybrać 10/50/100 elementów na stronę.
- Kryteria akceptacji:
  - Domyślnie ustawione jest 10.
  - Zmiana na 50 lub 100 odświeża widok zgodnie z wyborem.

US-007
- Tytuł: Dodanie karty z użyciem AI
- Opis: Jako użytkownik chcę wprowadzić angielskie słowo/kolokację, wygenerować polskie tłumaczenie i dodać kartę.
- Kryteria akceptacji:
  - Kliknięcie Generuj blokuje wpisywanie tlumaczenia, pokazuje spinner, wywołuje propozycję tłumaczenia i po zakończenia generowania wylacza spinner i odblokowuje mozliwosc edycji tłumaczenia.
  - Mogę edytować oba pola przed zapisem.
  - Po dodaniu karta pojawia się na górze listy.
  - Zdarzenia telemetryczne: generate_clicked, translate_generated, card_added_after_generate.

US-008
- Tytuł: Regeneracja tłumaczenia bez limitów
- Opis: Jako użytkownik chcę móc wielokrotnie przegenerować tłumaczenie, dopóki nie zaakceptuję lub nie anuluję.
- Kryteria akceptacji:
  - Mogę wywołać regenerację dowolną liczbę razy.
  - Interfejs pokazuje ostatnią propozycję jako bieżącą do edycji/zapisu.

US-009
- Tytuł: Dodanie karty bez użycia AI
- Opis: Jako użytkownik chcę móc ręcznie wprowadzić tłumaczenie i dodać kartę bez generowania.
- Kryteria akceptacji:
  - Przycisk Dodaj jest dostępny po ręcznym uzupełnieniu obu pól.
  - Po dodaniu karta pojawia się na górze listy.

US-010
- Tytuł: Blokada duplikatów 1:1
- Opis: Jako użytkownik nie chcę dodawać duplikatów istniejących kart.
- Kryteria akceptacji:
  - Normalizacja porównania: trim, lowercase, pojedyncze spacje.
  - Próba dodania duplikatu pokazuje komunikat i nie dodaje karty.
  - Brak opcji przejścia do edycji istniejącej karty w tym miejscu.

US-011
- Tytuł: Edycja istniejącej karty
- Opis: Jako użytkownik chcę edytować słowo/kolokację i tłumaczenie w dialogu, mam mozliwosc ponownego wygenerowania przez AI.
- Kryteria akceptacji:
  - Mogę zmienić oba pola i zapisać zmiany.
  - Pole updatedAt jest aktualizowane.

US-012
- Tytuł: Usuwanie karty z potwierdzeniem
- Opis: Jako użytkownik chcę trwale usunąć kartę po potwierdzeniu, bez opcji cofnięcia.
- Kryteria akceptacji:
  - Modal potwierdzenia z opcjami Tak/Nie.
  - Po potwierdzeniu karta znika z listy; zdarzenie delete_confirmed zapisane w logach.

US-013
- Tytuł: Interfejs w języku polskim
- Opis: Jako użytkownik chcę, aby cały interfejs był po polsku.
- Kryteria akceptacji:
  - Wszystkie etykiety, komunikaty i stany są w języku polskim.

US-014
- Tytuł: Telemetria zdarzeń kluczowych
- Opis: Jako zespół produktu chcemy rejestrować zdarzenia do pomiaru metryki akceptacji.
- Kryteria akceptacji:
  - Logowane są co najmniej: generate_clicked, translate_generated, card_added_after_generate, edit_saved, delete_confirmed, dialog_add_canceled.
  - Logi zawierają identyfikator użytkownika i znacznik czasu.

US-015
- Tytuł: Obsługa błędów generowania AI
- Opis: Jako użytkownik chcę otrzymać jasny komunikat, gdy generowanie zawiedzie, i móc ponowić.
- Kryteria akceptacji:
  - W przypadku błędu AI/timeout pojawia się komunikat i opcja ponów.
  - Wartości pól są zachowane.

US-016
- Tytuł: Obsługa błędów zapisu i autoryzacji
- Opis: Jako użytkownik chcę zrozumiałe komunikaty, gdy zapis/operacja nie powiedzie się.
- Kryteria akceptacji:
  - Brak autoryzacji zwraca 401 i komunikat; po odświeżeniu sesji operacja może zostać ponowiona.
  - Błąd sieci nie usuwa danych z formularza.

US-017
- Tytuł: Bezpieczny dostęp do API
- Opis: Jako system chcę, aby dostęp do danych był możliwy tylko z ważnym JWT.
- Kryteria akceptacji:
  - Wszystkie chronione endpointy wymagają nagłówka Authorization: Bearer <token>.
  - Tokeny są walidowane względem Supabase JWK.
  - Backend nie przyjmuje ani nie przechowuje haseł.

US-018
- Tytuł: Anulowanie dodawania karty
- Opis: Jako użytkownik chcę móc zamknąć dialog bez dodania karty.
- Kryteria akceptacji:
  - Zamknięcie dialogu przed zapisem rejestruje dialog_add_canceled.
  - Taka sesja wchodzi do mianownika metryki akceptacji.

US-019
- Tytuł: Mobile‑first ergonomia
- Opis: Jako użytkownik chcę wygodnie korzystać z aplikacji na małym ekranie.
- Kryteria akceptacji:
  - Elementy interaktywne mają odpowiednie rozmiary dotykowe.
  - Kluczowe przepływy (dodanie, edycja, usunięcie) są w pełni wykonalne na telefonie.

US-020
- Tytuł: Normalizacja i przechowywanie oryginału
- Opis: Jako użytkownik chcę zachować oryginalną pisownię, przy jednoczesnym wykrywaniu duplikatów po wersji znormalizowanej.
- Kryteria akceptacji:
  - System przechowuje oryginalny tekst.
  - Do porównań używa normalizacji: trim, lowercase, pojedyncze spacje.


## 6. Metryki sukcesu

- Cel główny: 75% akceptacji tłumaczeń AI.
  - Definicja akceptacji: dodano kartę po wygenerowaniu tłumaczenia (z lub bez edycji).
  - Definicja mianownika: sesje zakończone akceptacją lub anulowaniem po generowaniu (zaakceptowane + anulowane są w mianowniku).
  - Proponowane okno czasowe: kroczące 30 dni; minimalna próbka 100 sesji.
  - Zdarzenia wymagane do pomiaru: generate_clicked, translate_generated, card_added_after_generate, dialog_add_canceled.
  - Raport: dzienny wykres akceptacji oraz licznik prób na użytkownika.

- Dodatkowe wskaźniki zdrowia produktu (MVP):
  - Odsetek błędów generowania AI i średnia liczba regeneracji na kartę.
  - Odsetek odrzuceń dodania z powodu duplikatu.
  - Skuteczność logowania i odświeżania sesji (odsetek odpowiedzi 2xx dla auth).



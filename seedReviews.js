const sequelize = require("./config/db");
const Review = require("./models/Review");

// Мок-данные для отзывов
const mockReviews = [
  {
    user_id: 1,
    user_name: "Anna Kowalska",
    rating: 5,
    comment: "Fantastyczne torty! Zamówiłam tort urodzinowy dla córki i był absolutnie przepyszny. Wszyscy goście byli zachwyceni. Polecam z całego serca!"
  },
  {
    user_id: 2,
    user_name: "Piotr Nowak",
    rating: 5,
    comment: "Najlepsza cukiernia w mieście! Tort weselny był idealny - piękny wygląd i wyśmienity smak. Profesjonalna obsługa i terminowa dostawa."
  },
  {
    user_id: 3,
    user_name: "Maria Wiśniewska",
    rating: 4,
    comment: "Bardzo dobrej jakości produkty. Tort był smaczny, choć trochę drogi. Ogólnie polecam, szczególnie na specjalne okazje."
  },
  {
    user_id: 4,
    user_name: "Jan Zieliński",
    rating: 5,
    comment: "Zamówiłem tort na rocznicę ślubu. Był nie tylko piękny, ale też przepyszny. Żona była zachwycona! Dziękuję za wspaniałą pracę."
  },
  {
    user_id: 5,
    user_name: "Katarzyna Szymańska",
    rating: 5,
    comment: "Tort dla dziecka był wykonany perfekcyjnie. Wszystkie szczegóły zgodne z zamówieniem. Dziecko było w siódmym niebie! Na pewno zamówię jeszcze."
  },
  {
    user_id: 6,
    user_name: "Tomasz Wójcik",
    rating: 4,
    comment: "Dobra jakość, szybka realizacja. Tort był smaczny, choć oczekiwałem trochę więcej dekoracji. Mimo wszystko polecam."
  },
  {
    user_id: 7,
    user_name: "Agnieszka Król",
    rating: 5,
    comment: "Profesjonalna obsługa od początku do końca. Tort świąteczny był idealny - piękny i smaczny. Cała rodzina była zachwycona!"
  },
  {
    user_id: 8,
    user_name: "Marcin Dąbrowski",
    rating: 3,
    comment: "Tort był w porządku, ale nie zachwycił. Smak dobry, ale wygląd mógłby być lepszy. Cena adekwatna do jakości."
  },
  {
    user_id: 9,
    user_name: "Ewa Lewandowska",
    rating: 5,
    comment: "Najlepszy tort, jaki kiedykolwiek jadłam! Zamówiłam tort domowy i był absolutnie przepyszny. Na pewno wrócę po więcej!"
  },
  {
    user_id: 10,
    user_name: "Paweł Kozłowski",
    rating: 4,
    comment: "Dobra cukiernia z szerokim wyborem. Tort był smaczny, choć dostawa mogłaby być szybsza. Ogólnie polecam."
  },
  {
    user_id: 11,
    user_name: "Magdalena Jankowska",
    rating: 5,
    comment: "Tort weselny był absolutnie idealny! Wszystko zgodne z oczekiwaniami - piękny wygląd, wyśmienity smak. Goście nie mogli przestać chwalić!"
  },
  {
    user_id: 12,
    user_name: "Krzysztof Mazur",
    rating: 4,
    comment: "Zamówiłem tort na urodziny. Był bardzo dobry, choć trochę za słodki dla mojego gustu. Mimo wszystko polecam."
  },
  {
    user_id: 13,
    user_name: "Joanna Kwiatkowska",
    rating: 5,
    comment: "Fantastyczna obsługa i wspaniałe produkty! Tort dla dziecka był wykonany z najwyższą starannością. Na pewno zamówię jeszcze!"
  },
  {
    user_id: 14,
    user_name: "Robert Krawczyk",
    rating: 3,
    comment: "Tort był w porządku, ale nie spełnił moich oczekiwań. Smak dobry, ale wygląd mógłby być bardziej imponujący."
  },
  {
    user_id: 15,
    user_name: "Aleksandra Nowak",
    rating: 5,
    comment: "Najlepsza cukiernia! Tort świąteczny był absolutnie przepyszny. Wszyscy goście byli zachwyceni. Polecam z całego serca!"
  },
  {
    user_id: 16,
    user_name: "Michał Piotrowski",
    rating: 4,
    comment: "Dobra jakość produktów. Tort był smaczny i ładnie wykonany. Jedynym minusem była dłuższa niż oczekiwana dostawa."
  },
  {
    user_id: 17,
    user_name: "Natalia Górski",
    rating: 5,
    comment: "Tort urodzinowy był idealny! Piękny wygląd, wyśmienity smak. Profesjonalna obsługa i terminowa realizacja. Polecam!"
  },
  {
    user_id: 18,
    user_name: "Łukasz Rutkowski",
    rating: 4,
    comment: "Zamówiłem tort na rocznicę. Był bardzo dobry, choć oczekiwałem trochę więcej dekoracji. Mimo wszystko polecam."
  },
  {
    user_id: 19,
    user_name: "Karolina Pawlak",
    rating: 5,
    comment: "Fantastyczne torty! Zamówiłam tort domowy i był absolutnie przepyszny. Cała rodzina była zachwycona. Na pewno wrócę!"
  },
  {
    user_id: 20,
    user_name: "Adam Michalski",
    rating: 5,
    comment: "Najlepszy tort, jaki kiedykolwiek zamówiłem! Profesjonalna obsługa, piękny wygląd i wyśmienity smak. Polecam z całego serca!"
  },
  {
    user_id: 21,
    user_name: "Monika Zając",
    rating: 4,
    comment: "Dobra cukiernia z szerokim wyborem produktów. Tort był smaczny i ładnie wykonany. Ogólnie polecam na specjalne okazje."
  },
  {
    user_id: 22,
    user_name: "Jakub Król",
    rating: 5,
    comment: "Tort weselny był wykonany perfekcyjnie! Wszystkie szczegóły zgodne z zamówieniem. Goście nie mogli przestać chwalić. Dziękuję!"
  },
  {
    user_id: 23,
    user_name: "Sylwia Wojciechowska",
    rating: 3,
    comment: "Tort był w porządku, ale nie zachwycił. Smak dobry, ale wygląd mógłby być lepszy. Cena adekwatna do jakości."
  },
  {
    user_id: 24,
    user_name: "Bartosz Sikora",
    rating: 5,
    comment: "Profesjonalna obsługa i wspaniałe produkty! Tort dla dziecka był idealny - piękny i smaczny. Na pewno zamówię jeszcze!"
  },
  {
    user_id: 25,
    user_name: "Weronika Baran",
    rating: 4,
    comment: "Zamówiłam tort na urodziny. Był bardzo dobry, choć trochę za słodki dla mojego gustu. Mimo wszystko polecam."
  }
];

async function seedReviews() {
  try {
    // Подключение к базе данных
    await sequelize.authenticate();
    console.log("Połączenie z bazą danych zostało nawiązane pomyślnie.");

    // Синхронизация модели (если таблица не существует, она будет создана)
    await Review.sync({ force: false });
    console.log("Model Review został zsynchronizowany.");

    // Проверка, есть ли уже отзывы
    const existingReviews = await Review.count();
    if (existingReviews > 0) {
      console.log(`W bazie danych znajduje się już ${existingReviews} opinii.`);
      console.log("Czy chcesz dodać więcej opinii? (Użyj force: true, aby usunąć istniejące)");
    }

    // Добавление мок-данных
    console.log("Dodawanie opinii do bazy danych...");
    for (const review of mockReviews) {
      await Review.create(review);
    }

    console.log(`Pomyślnie dodano ${mockReviews.length} opinii do bazy danych!`);
    
    // Подсчет статистики
    const totalReviews = await Review.count();
    const avgRating = await Review.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });
    
    console.log(`\nStatystyki:`);
    console.log(`- Łączna liczba opinii: ${totalReviews}`);
    console.log(`- Średnia ocena: ${parseFloat(avgRating[0].avgRating).toFixed(2)}`);

  } catch (error) {
    console.error("Błąd podczas dodawania opinii:", error);
  } finally {
    await sequelize.close();
    console.log("\nPołączenie z bazą danych zostało zamknięte.");
  }
}

// Запуск скрипта
seedReviews();


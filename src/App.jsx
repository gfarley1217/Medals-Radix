import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Country from "./components/Country";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);

  // ✅ YOUR API endpoint from Swagger:
  // GET  /Api/Country
  // POST /Api/Country
  // DELETE /Api/Country/{id}
  const apiEndpoint =
    "https://medalsapi-f9ctesa0gvbkd3ht.westus3-01.azurewebsites.net/Api/Country";

  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }

  // ✅ Load initial data from DB
  useEffect(() => {
    async function fetchData() {
      const { data: fetchedCountries } = await axios.get(apiEndpoint);
      setCountries(fetchedCountries);
    }

    fetchData();
  }, []);

  // ✅ Add country => save to DB
  const handleAdd = async (name) => {
    try {
      // Optional: prevent duplicates by name (not required, but helps)
      if (
        countries.some(
          (c) => c.name?.toLowerCase() === name.trim().toLowerCase()
        )
      ) {
        alert("That country already exists.");
        return;
      }

      const { data: created } = await axios.post(apiEndpoint, {
        name: name.trim(),
        gold: 0,
        silver: 0,
        bronze: 0,
      });

      setCountries(countries.concat(created));
    } catch (ex) {
      alert("An error occurred while adding a country.");
      console.log(ex);
    }
  };

  // ✅ Delete country => remove from DB (optimistic like class)
  const handleDelete = async (countryId) => {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== countryId));

    try {
      await axios.delete(`${apiEndpoint}/${countryId}`);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        console.log(
          "The record does not exist - it may have already been deleted"
        );
      } else {
        alert("An error occurred while deleting a country.");
        setCountries(originalCountries); // rollback
      }
      console.log(ex);
    }
  };

  // ❌ Increment/Decrement should NOT be saved to DB (state only)
  function handleIncrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    if (idx === -1) return;

    const mutableCountries = [...countries];
    mutableCountries[idx] = {
      ...mutableCountries[idx],
      [medalName]: (mutableCountries[idx][medalName] ?? 0) + 1,
    };
    setCountries(mutableCountries);
  }

  function handleDecrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    if (idx === -1) return;

    const current = countries[idx][medalName] ?? 0;
    if (current <= 0) return; // optional guard against negatives

    const mutableCountries = [...countries];
    mutableCountries[idx] = {
      ...mutableCountries[idx],
      [medalName]: current - 1,
    };
    setCountries(mutableCountries);
  }

  function getAllMedalsTotal() {
    let sum = 0;
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + (b[medal.name] ?? 0), 0);
    });
    return sum;
  }

  return (
    <Theme appearance={appearance}>
      <Button
        onClick={toggleAppearance}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
        variant="ghost"
      >
        {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>

      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>

        <NewCountry onAdd={handleAdd} />
      </Flex>

      <Container className="bg" />

      <Grid pt="2" gap="2" className="grid-container">
        {countries
          .slice()
          .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              onDelete={handleDelete}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
    </Theme>
  );
}

export default App;
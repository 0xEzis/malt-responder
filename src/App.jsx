import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import "./index.css";
import MaltLogo from "./assets/malt-svgrepo-com.svg";
import "../node_modules/@picocss/pico/css/pico.min.css";

export function App() {
  const [answer, setAnswer] = useState("");
  const resetForm = () => {
    reset();
    setAnswer("");
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const APIValue = watch("API");
  const nameValue = watch("name");
  const telValue = watch("tel");

  const generatePrompt = (data) => {
    let prompt = `J'ai reçu une offre de travail que je souhaite que tu analyses et auxquelles tu répondes. Voici les détails :

    Offre : ${data["Offre"]}

    Voici aussi des informations sur moi :
    Mon nom : ${data["name"]}
    Numéro de téléphone pour la communication : ${
      data["tel"] ? data["tel"] : "Non renseigné"
    }
    
    S'il te plaît, élabore une réponse professionnelle et engageante, en montrant de l'intérêt pour le projet, en partageant mes compétences et mon expérience pertinentes, en posant des questions pour mieux comprendre le projet.
    Utilise mes informations en fin de réponse seulement. Tu peux commencer en lui disant bonjour et en le remerciant pour son offre.
    Ensuite, tu peux lui dire que tu es intéressé par son offre et que tu 
    `;
    if (data["offerType"] === "Devis") {
      prompt += `Propose lui d'établir directement un devis si mon profil lui convient.`;
    } else if (data["offerType"] === "Appel") {
      prompt += `Propose lui un appel en lui indiquant mon numéro de téléphone afin d'obtenir plus de renseignement. Donne-lui également deux disponibilités pour un rendez-vous.`;
    }
    return prompt;
  };

  const onSubmit = async (data) => {
    try {
      // Envoie des données à votre API
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: generatePrompt(data),
          max_tokens: 1500,
          temperature: 0.5,
        }),

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data["API"]}`,
        },
      });

      const responseData = await response.json();

      // Utilisez setValue pour mettre à jour votre zone de texte
      setAnswer(responseData.choices[0].text);
    } catch (error) {
      console.error("Erreur de requête API:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="p-4">
      <div className="mt-4 mb-8 flex justify-center items-center gap-3 bg-clip-text text-transparent">
        <img
          src={MaltLogo}
          alt="Malt Logo"
          height={60}
          width={60}
        />
        <h1 className="m-0 text-4xl font-bold text-malt-color ">Responder</h1>
      </div>
      <p className="text-center text-white text-xl">
        Tu en as marre d'écrire tes messages pour répondre aux appels d'offres
        <span className="text-malt-color"> Malt</span> ?{" "}
        <span className="block mt-8 underline underline-offset-4 decoration-malt-color decoration-4">
          Tu es au bon endroit !
        </span>
      </p>
      <p className="text-white mt-8">
        Il te suffit de remplir le formulaire ci-dessous et de copier la réponse
        ainsi générée.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-4 mt-4">
          <label htmlFor="name" className="basis-1/2">
            Nom
            <input
              className="mb-0"
              {...register("name", { required: true })}
              placeholder="Nom"
              id="name"
              defaultValue=""
              aria-invalid={errors.name ? "true" : nameValue ? "false" : ""}
            />
          </label>

          <label htmlFor="tel" className="basis-1/2">
            Téléphone <span className="italic text-sm">(optionnel)</span>
            <input
              {...register("tel", { required: false })}
              pattern="[0-9]+"
              id="tel"
              type="tel"
              placeholder="Téléphone"
              minLength={10}
              maxLength={20}
              aria-invalid={errors.tel ? "true" : telValue ? "false" : ""}
            />
          </label>
        </div>
        <label htmlFor="API">
          API Key
          <input
            type="password"
            placeholder="API Key"
            {...register("API", {
              required: true,
              maxLength: 51,
              minLength: 51,
            })}
            aria-invalid={
              errors.API
                ? "true"
                : APIValue
                ? APIValue.length === 51
                  ? "false"
                  : "true"
                : ""
            }
          />
        </label>
        {errors.API && <span>API Key invalide</span>}

        <fieldset className="mb-8">
          <p className="text-center mb-2 text-white">Type de réponse</p>
          <div className="flex justify-center items-center gap-10">
            <label
              htmlFor="Devis"
              className="flex-row justify-center items-center gap-2"
            >
              <input
                {...register("offerType", { required: true })}
                id="Devis"
                type="radio"
                value="Devis"
                aria-invalid={errors.offerType ? "true" : ""}
              />
              Devis
            </label>
            <label
              htmlFor="Appel"
              className="flex-row justify-center items-center gap-2"
            >
              <input
                {...register("offerType", { required: true })}
                id="Appel"
                type="radio"
                value="Appel"
                aria-invalid={errors.offerType ? "true" : ""}
              />
              Appel
            </label>
          </div>
        </fieldset>

        <label htmlFor="Offre">
          Appel d'offre (150 caractères minimum)
          <textarea
            className="resize-none"
            {...register("Offre", { required: true })}
            id="offer"
            aria-invalid={errors.Offre ? "true" : ""}
            minLength={150}
            rows={5}
          />
        </label>
        {errors.Offre && <span>Veuillez saisir un appel d'offre</span>}

        <div className="flex justify-center items-center gap-4">
          <button
            className="text-white uppercase w-2/5 py-2 px-4 m-auto mt-2 bg-malt-color border-none"
            type="submit"
          >
            Générer
          </button>
          <button
            className="text-white uppercase w-2/5 py-2 px-4 m-auto mt-2 bg-malt-color border-none"
            type="reset"
            onClick={resetForm}
          >
            Réinitialiser
          </button>
        </div>
      </form>
      {answer && (
        <div className="">
          <h2 className="mb-4">Réponse</h2>
          <div className="border-solid border-2 border-gray-600 rounded-lg py-2 px-2 whitespace-pre-line">
            {answer}
          </div>
          <button
            className="text-white uppercase w-3/5 py-2 px-4 m-auto mt-2 bg-malt-color border-none"
            onClick={() => copyToClipboard(answer)}
          >
            Copier
          </button>
        </div>
      )}
    </div>
  );
}

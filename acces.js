(() => {
    const HASH_ATTENDU = "81d6f9759fd2767dd45d476fd0cf9f73503e6684275e3ff2e92b6abd20cf4674";
    const racine = new URL(".", document.currentScript.src);
    const cleSession = "dossier-moi-acces:" + racine.pathname;
    const estAutorise = () => {
        try { return sessionStorage.getItem(cleSession) === HASH_ATTENDU; }
        catch { return false; }
    };

    if (estAutorise()) return;
    document.documentElement.classList.add("acces-verrouille");

    async function sha256(texte) {
        const donnees = new TextEncoder().encode(texte);
        const hashBuffer = await crypto.subtle.digest("SHA-256", donnees);
        return Array.from(new Uint8Array(hashBuffer))
            .map(octet => octet.toString(16).padStart(2, "0"))
            .join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        const entree = document.createElement("section");
        entree.id = "acces-entree";
        entree.setAttribute("aria-labelledby", "acces-titre");
        entree.innerHTML = `
            <form class="acces-carte">
                <p class="acces-surtitre">Dossier Moi</p>
                <div class="acces-sceau" aria-hidden="true">🔐</div>
                <h1 id="acces-titre">Chaque histoire<br>a sa clé.</h1>
                <p class="acces-invitation">Entrez le mot de passe pour découvrir mon univers.</p>
                <label for="password">Mot de passe</label>
                <input type="password" id="password" placeholder="Mot de passe"
                    autocomplete="off" required aria-describedby="message" />
                <button type="submit">Se connecter 🔐</button>
                <p id="message" role="status" aria-live="polite"></p>
            </form>`;
        document.body.append(entree);
        const champ = entree.querySelector("input");
        const bouton = entree.querySelector("button");
        const message = entree.querySelector("#message");
        champ.focus();

        entree.querySelector("form").addEventListener("submit", async event => {
            event.preventDefault();
            bouton.disabled = true;
            message.textContent = "";
            try {
                if (!crypto.subtle) {
                    message.textContent = "Ouvrez le site en HTTPS ou avec le serveur local pour vous connecter.";
                    return;
                }
                const hashSaisi = await sha256(champ.value);
                champ.value = "";
                if (hashSaisi !== HASH_ATTENDU) {
                    message.textContent = "❌ Mot de passe incorrect.";
                    champ.focus();
                    return;
                }
                // L'autorisation dure uniquement pendant la session de cet onglet.
                sessionStorage.setItem(cleSession, HASH_ATTENDU);
                document.documentElement.classList.remove("acces-verrouille");
                entree.remove();
                document.querySelector("#enter-universe, main a, main button, a, button")?.focus();
            } catch {
                message.textContent = "La connexion est impossible. Autorisez le stockage de session dans votre navigateur, puis réessayez.";
            } finally {
                bouton.disabled = false;
            }
        });
    });
})();

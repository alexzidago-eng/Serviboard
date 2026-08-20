export const metadata = {
  title: "ServiBoard — Trouve un prestataire près de chez toi",
  description:
    "Plombiers, couturières, répétiteurs, livreurs — trouvez quelqu'un de confiance dans votre quartier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>       
    </html>                        
  );
}
                             

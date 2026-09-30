TELEGRAM MINI APP - CRESCIMENTO INFANTIL OMS v0.2

MUDANÇA PRINCIPAL DA v0.2
- Não depende de tabelas fixas incorporadas ao pacote.
- Em toda abertura tenta obter online os coeficientes LMS.
- Usa cache: no-store para evitar uma cópia HTTP antiga.
- Valida faixa etária, quantidade de registros e coeficientes antes de aceitar uma atualização.
- Salva a última cópia válida em localStorage.
- Se a internet/fonte estiver indisponível, usa a última cópia válida.
- Informa na tela se os dados vieram da atualização online ou do cache e a data/hora da última atualização válida.

FAIXA DO APP
- Nascimento até 60 meses: WHO Child Growth Standards 2006.
- Acima de 60 meses até 15 anos: WHO Growth Reference 2007.

FONTES OFICIAIS DE REFERÊNCIA
0-5 anos:
https://www.who.int/toolkits/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age

5-19 anos:
https://www.who.int/toolkits/growth-reference-data-for-5to19-years/indicators/bmi-for-age

FONTE MACHINE-READABLE USADA PELO CLIENTE v0.2
Os coeficientes LMS são obtidos online do projeto open-source RCPCH growth-references, que representa as referências WHO em CSV. O aplicativo valida os dados antes de usá-los e mantém cache da última versão válida.

OBSERVAÇÃO PARA PRODUÇÃO
A OMS publica oficialmente planilhas XLSX nas páginas acima. Uma futura v0.3 pode trocar o feed CSV por um pequeno serviço nosso que faça download/validação diretamente dos XLSX oficiais da OMS e entregue JSON assinado ao Mini App. Isso elimina dependência de um espelho GitHub e mantém a atualização online.

PUBLICAÇÃO NO TELEGRAM
1. Hospede esta pasta em HTTPS (Cloudflare Pages, Netlify, Vercel, GitHub Pages etc.).
2. No @BotFather crie ou selecione o bot.
3. /mybots > Bot Settings > Menu Button > Configure menu button.
4. Informe a URL HTTPS do index.html.
5. Abra o bot e teste pelo botão do menu.

PRIVACIDADE
Esta versão não envia nome, data de nascimento, peso ou altura para nosso servidor. Os cálculos ocorrem no navegador do Mini App. O localStorage guarda apenas a referência de crescimento e metadados da atualização.

USO MÉDICO
Resultado informativo. Não substitui avaliação pediátrica/profissional. Em menores de 5 anos, a OMS também utiliza peso-para-comprimento/altura na avaliação nutricional.

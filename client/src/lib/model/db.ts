const DB_SERVER = "http://localhost:3000";

export function hash(s: string): number {
  var hash = 5381;
  if (s.length == 0) return hash;
  for (let x = 0; x < s.length; x++) {
    let ch = s.charCodeAt(x);
    hash = (hash * 33) ^ ch;
  }
  return (hash >>> 0) & 0x7fffffff;
}

export class Statement {
  constructor(
    public id: number,
    public pathToCSV: string,
    public transactionMethod: string,
    public date: Date,
  ) {}
}

export class Transaction {
  constructor(
    public id: number,
    public date: Date,
    public category: string,
    public amount: number,
    public method: string,
    public description: string,
    public stmt_id: number,
  ) {}
}

async function get(endpoint: string): Promise<Object | undefined> {
  const url = `${DB_SERVER}${endpoint}`;
  console.log(`GET: ${url}`);
  try {
    const response = await fetch(url);
    const data = response.json();
    console.log(`SUCCESS: ${url}`);
    return data;
  } catch (error) {
    console.error(`Error in getting ${endpoint}`, error);
    return undefined;
  }
}

async function getFile(endpoint: string): Promise<Blob | undefined> {
  const url = `${DB_SERVER}${endpoint}`;
  console.log(`GET FILE: ${url}`);
  try {
    const response = await fetch(url);
    const data = response.blob();
    console.log(`SUCCESS: ${url}`);
    return data;
  } catch (error) {
    console.error(`Error in getting ${endpoint}`, error);
    return undefined;
  }
}

async function post(
  endpoint: string,
  options: RequestInit,
): Promise<Object | undefined> {
  const url = `${DB_SERVER}${endpoint}`;
  console.log(`POST: ${url}`);
  console.log(options);
  try {
    const response = await fetch(url, options);
    const data = response.json();
    console.log(`SUCCESS: ${url}`);
    return data;
  } catch (error) {
    console.error(`Error in getting ${endpoint}`, error);
    return undefined;
  }
}

export async function getStatements(): Promise<Statement[]> {
  const data = (await get("/statements")) as Statement[];
  return data.map(
    (v) => new Statement(v.id, v.pathToCSV, v.transactionMethod, v.date),
  );
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = (await get("/transactions")) as Transaction[];
  return data;
}

export async function downloadStatement(id: number) {
  const data = await getFile(downloadStatementLink(id));
  return data;
}

export function downloadStatementLink(id: number): string {
  return `${DB_SERVER}/statements/${id}/download`;
}

export async function uploadStatement(
  file: File,
  date: Date,
  txMethod: string,
): Promise<Statement | undefined> {
  // Insert meta information about the upload
  let form = new FormData();
  form.append("file", file);
  form.append("date", date.toISOString());
  form.append("txMethod", txMethod);

  // Compile POST request initializer
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };

  // UPload
  const statement = await post(
    `/statements/upload?date=${date.toISOString()}&txMethod=${txMethod}`,
    requestOptions,
  );
  return new Promise((res, rej) => {
    if (statement == undefined) {
      rej(`Something went wrong uploading ${file.name}`);
    }
    res(statement as Statement);
  });
}

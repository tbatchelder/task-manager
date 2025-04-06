// This code defines an asynchronous TypeScript function called parseJSON that fetches and parses a JSON file.
// It takes a single parameter which is the url to the JSON file.
// It then uses the fetch API to request the file and waits for until it completes the fetching.
// If the response was successful, it parses the response and returns it.

// The JSON file doesn't necessarily need a JSON extension but must point to a valid JSON data file.
// If it's in the public directory, that path could look like /data/mydata.json.  The public serves as a root directory for this.
// It could also be a data file within the API such as "/api/data".
// It could even be in an environmental file such as "${process.env.NEXT_PUBLIC_API_URL}/endpoint".

// It must be called with an asynchronous function such as const data = await parseJSON("/data/products.json");
// It will typically be used with a useEffect hook, a data fetching library like SWR or React Query, or in Next.js data fetching methods like getStaticProps or getServerSideProps

// Now, while we could add an interface and a try/catch error checker here, we don't want to do that since this is a generic loader.
// We'll check for errors when we call this function so we can better customize our error handler.

export const parseJSON = async (filePath: string) => {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(
      "Failed to fetch the ${filePath} JSON file. HTTP status: ${response.status}"
    );
  }
  return response.json();
};

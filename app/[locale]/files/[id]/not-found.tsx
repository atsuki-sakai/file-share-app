export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">File Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
        The file you're looking for doesn't exist or has been removed.
      </p>
    </div>
  )
}
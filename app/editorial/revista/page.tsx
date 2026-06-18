export default function RevistaAdmin() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Revista Empreende Brazil
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Novos</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Briefings</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Produção</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Publicados</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">
          Clientes da Revista
        </h2>

        <button className="bg-black text-white px-4 py-2 rounded">
          Novo Cliente
        </button>
      </div>
    </div>
  );
}
type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {

  return (

    <div className="
      flex
      items-center
      justify-between
      p-8
      border-b
      border-gray-100
      bg-white
    ">

      <div>

        <h1 className="
          text-2xl
          font-black
          text-black
        ">
          {title}
        </h1>

        {description && (

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            {description}
          </p>

        )}

      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>

  );

}
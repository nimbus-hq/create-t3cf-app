import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState } from "react";

import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/16/solid';

const commands = [
  {
    command: "create t3cf-app@latest",
    manager: "npm",
  },
  {
    command: "create t3cf-app",
    manager: "yarn",
  },
  {
    command: "create t3cf-app@latest",
    manager: "pnpm",
  },
  {
    command: "create t3cf-app@latest",
    manager: "bun",
  },
];

export default function ClipboardSelect() {
  const [coolDown, setCoolDown] = useState(false);
  const [commandDetails, setCommandDetails] = useState({
    command: "create t3cf-app@latest",
    manager: "npm",
  })

  const handleCopyToClipboard = async (manager: string, command: string) => {
    const nextClipboard = `${manager} ${command}`;
    setCommandDetails({manager: manager, command: command});
    try {
      await navigator.clipboard.writeText(nextClipboard);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const checkStyles = {
    strokeDasharray: 450,
    strokeDashoffset: -30,
  };

  return (
    <div className="mx-auto flex flex-row bg-cfdark rounded-lg border border-slate-500 text-white mt-10 bg-opacity-85 p-2 sm:text-sm md:px-3 md:py-3 md:text-lg lg:px-5 lg:py-4 lg:text-xl">
      <code className="mx-4 p-1 transition-transform">{commandDetails.manager + " " + commandDetails.command}</code>
      <div className="flex items-center gap-2">
        <Menu as="div">
          <div className="relative">
            <MenuButton disabled={coolDown} className="mx-4 relative flex cursor-pointer items-center justify-center rounded-lg border border-slate-500 bg-cfdark text-left focus:outline-none hover:bg-slate-400 sm:text-sm opacity-75">
              {coolDown ? <CheckIcon className={'w-6 p-1'}/> : <DocumentDuplicateIcon className="w-6 p-1" color="white"/>}
            </MenuButton>
            
            <Transition
              as={Fragment}
              enter={"transition ease-out duration-100"}
              enterFrom={"transform opacity-0 -translate-y-1"}
              enterTo={"transform opacity-100 -translate-y-0"}
            >
              <MenuItems
                className={clsx(
                  "focus-none shadow-l t3-scrollbar absolute right-0 mt-1 max-h-60 w-fit min-w-[6em] overflow-auto rounded-lg border border-slate-500 bg-cfdark text-base focus:outline-none focus-visible:outline-none sm:text-sm",
                )}
              >
                {commands.map(({ manager, command }) => (
                  <MenuItem key={manager}>
                    {({ active }) => {
                      return (
                        <button
                          className={`${
                            active && "bg-t3-purple-200/20"
                          } group flex w-full items-center bg-t3-purple-200/10 px-4 py-2 text-sm font-medium hover:bg-t3-purple-200/20`}
                          onClick={() => {
                            handleCopyToClipboard(manager, command)
                              .then(() => {
                                setCoolDown(true);
                                setTimeout(() => {
                                  setCoolDown(false);
                                }, 750);
                              })
                              .catch((err) => console.log(err));
                          }}
                        >
                          {manager}
                        </button>
                      );
                    }}
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </div>
        </Menu>
      </div>
    </div>
  );
}

// TODO add Feedback to user, make command prompt animate when changing lengths, or set length to something specific.
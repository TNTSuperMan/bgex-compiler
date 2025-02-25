export const lib = `; Standard library
:std_bigint_add
/ a0 04 store${""/*value*/}
/ a0 03 store${""/*addrDD*/}
/ a0 02 store${""/*addrDU*/}
/ a0 01 store${""/*addrUD*/}
/ a0 00 store${""/*addrUU*/}

/ a0 04 load${""/*value*/}
/ ff a0 02 load a0 03 load load sub${""/*255-D*/}
/ greater :std_bigint_add_true truejump
/ :std_bigint_add_end jump
:std_bigint_add_true

/ a0 00 load a0 01 load load${""/*load U*/}
/ 1 add${""/*add 1*/}
/ a0 00 load a0 01 load store${""/*store U*/}

:std_bigint_add_end

/ a0 02 load a0 03 load load${""/*load D*/}
/ a0 04 load add${""/*add value*/}
/ a0 02 load a0 03 load store${""/*save D*/}

/ ret

:std_bigint_sub
/ a0 04 store${""/*value*/}
/ a0 03 store${""/*addrDD*/}
/ a0 02 store${""/*addrDU*/}
/ a0 01 store${""/*addrUD*/}
/ a0 00 store${""/*addrUU*/}

/ a0 04 load${""/*value*/}
/ a0 02 load a0 03 load load${""/*D*/}
/ greater :std_bigint_sub_true truejump
/ :std_bigint_sub_end jump
:std_bigint_sub_true

/ a0 00 load a0 01 load load${""/*load U*/}
/ 1 sub${""/*add 1*/}
/ a0 00 load a0 01 load store${""/*store U*/}

:std_bigint_sub_end

/ a0 02 load a0 03 load load${""/*load D*/}
/ a0 04 load sub${""/*sub value*/}
/ a0 02 load a0 03 load store${""/*save D*/}

/ ret

`